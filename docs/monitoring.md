# Monitoring & Ops

This document covers the external health check for the production stack and the
Komodo alerting setup that receives its notifications.

> **No Komodo Stack is required.** The current deployment can remain managed by
> GitHub Actions, with Komodo monitoring only the server. The external checker
> below polls the app's public health endpoint and sends alerts directly to a
> Komodo Alerter through `SendAlert`.

## Overview

`scripts/komodo-healthcheck.sh` polls the public health endpoint (default
`https://leffaseura.club/api/health`) every 60 seconds from a macOS
LaunchAgent. It only calls Komodo when the health state changes:

| Transition                                  | Komodo `SendAlert` level |
| ------------------------------------------- | ------------------------ |
| UP → DOWN (including the first run if DOWN) | `CRITICAL`               |
| DOWN → UP                                   | `OK`                     |
| Initial UP                                  | no alert                 |
| No change                                   | no alert                 |

The state is stored in a persistent file, so a continuously-down or
continuously-up service does not spam Komodo. If Komodo rejects the request or
the alerter fails to deliver it, the state is **not** updated and the next run
retries the same transition.

The script calls:

```text
POST {KOMODO_URL}/execute/SendAlert
X-Api-Key: {KOMODO_API_KEY}
X-Api-Secret: {KOMODO_API_SECRET}
Content-Type: application/json
```

It inspects the returned Komodo `Update` object and only treats the alert as
delivered when `success` is `true`.

## Prerequisites

- macOS host running the production stack (the Mac mini).
- `curl` (bundled with macOS).
- `jq` **or** `python3` for JSON encoding/decoding. The script prefers `jq`
  and falls back to `python3`.
- A reachable Komodo Core instance and an API key/secret.
- The health endpoint publicly reachable from the Mac mini.

## Komodo setup

### 1. Create the alerter

In Komodo: **Settings → Alerters → New Alerter**.

Configure it as follows:

- **Enabled**: on.
- **Endpoint**: whatever destination should receive the alert (Discord,
  Slack, ntfy, Pushover, or a **Custom** HTTP endpoint). The health check does
  not care which endpoint type you use; Komodo forwards the alert to it.
- **Alert Types**: include **Custom**. This is required because
  `/execute/SendAlert` filters alerters to those that allow the `Custom` alert
  type. (Leaving the list empty also allows all types, including `Custom`.)
- **Resources**: leave **empty**. Do **not** use a resource whitelist.
- **Except Resources**: leave **empty**.
- **Maintenance windows**: optional; they suppress alerts while active.

> **Why no resource filter?** `SendAlert` is issued by an API key rather than
> by a monitored resource, so the resulting alert target is `System`. A
> resource-only whitelist will filter out the health check alert.

If you choose the **Custom** endpoint type, the endpoint URL must accept the
JSON `Alert` payload that Komodo POSTs to it. If you already have a Discord,
Slack, ntfy, or Pushover alerter, use that alerter and simply add the `Custom`
alert type.

Use the alerter's **Test** button in Komodo to confirm the destination works
before relying on the health check.

### 2. Create the API key

In Komodo: **Settings → API Keys → New API Key**.

- Prefer a dedicated service user over your admin account.
- The user needs **Read** and **Execute** permission on the alerter.
  `SendAlert` lists alerters at Read level and then checks Execute permission
  for non-admin users. An admin key works without extra grants, but a scoped
  service user is safer.

Copy the key and secret once; Komodo will not show the secret again.

### 3. Optional: enable server-unreachable alerts

If you want an additional alert when Komodo itself can no longer reach the
server, enable the **Server Unreachable** alert type on an Alerter. This is
separate from the app health check and only covers Komodo's connection to the
server; it does not check whether MovieClub or its database is healthy.

You do **not** need to register a Komodo Stack, enable Stack alerts, or move
deployment away from GitHub Actions for the external app health alerts to work.

## Configuration

Create the credential file **outside the repository**:

```bash
mkdir -p ~/.config/movieclub
install -m 600 /dev/null ~/.config/movieclub/komodo-health.env
```

Edit `~/.config/movieclub/komodo-health.env`:

```dotenv
# Required
KOMODO_URL=https://komodo.example.com
KOMODO_API_KEY=your_api_key
KOMODO_API_SECRET=your_api_secret
KOMODO_ALERTER_NAME=movieclub-health

# Optional overrides
# HEALTHCHECK_URL=https://leffaseura.club/api/health
# KOMODO_HEALTH_STATE_FILE=/Users/synapse/.local/state/movieclub/komodo-health.state
# HEALTHCHECK_RETRIES=2
# HEALTHCHECK_RETRY_DELAY=3
# KOMODO_HEALTH_TIMEOUT=10
# KOMODO_ALERT_TIMEOUT=15
```

Defaults:

| Variable                   | Default                                            |
| -------------------------- | -------------------------------------------------- |
| `HEALTHCHECK_URL`          | `https://leffaseura.club/api/health`               |
| `KOMODO_HEALTH_STATE_FILE` | `$HOME/.local/state/movieclub/komodo-health.state` |
| `HEALTHCHECK_RETRIES`      | `2`                                                |
| `HEALTHCHECK_RETRY_DELAY`  | `3` seconds                                        |
| `KOMODO_HEALTH_TIMEOUT`    | `10` seconds                                       |
| `KOMODO_ALERT_TIMEOUT`     | `15` seconds                                       |

The file is a shell-compatible `KEY=VALUE` file. The health check script
**refuses to run** if the file is readable or writable by group/other. Keep it
at mode `600`:

```bash
chmod 600 ~/.config/movieclub/komodo-health.env
```

Never commit this file, paste its contents into logs, or put it inside the
repository. The script never prints the API key or secret, and it passes the
API headers to `curl` through a temporary mode-600 file so they do not appear
in process listings.

## Install the LaunchAgent

```bash
bash scripts/install-komodo-healthcheck-launchd.sh
```

The installer:

- verifies the health check script and credential file are present;
- refuses a credential file that is group/other-accessible;
- writes `~/Library/LaunchAgents/com.movieclub.healthcheck.plist`;
- validates the plist with `plutil -lint`;
- loads the agent with `launchctl bootstrap`;
- kicks off an immediate run.

The agent uses `StartInterval` 60 seconds plus `RunAtLoad`, so it runs once at
login and then every minute. Logs are written to:

```text
~/Library/Logs/movieclub/healthcheck.stdout.log
~/Library/Logs/movieclub/healthcheck.stderr.log
```

To use a different credential file:

```bash
KOMODO_HEALTH_ENV_FILE=/path/to/komodo-health.env \
  bash scripts/install-komodo-healthcheck-launchd.sh
```

Check that it is loaded:

```bash
launchctl print "gui/$(id -u)/com.movieclub.healthcheck"
```

## Manual test

Run the script directly first:

```bash
bash scripts/komodo-healthcheck.sh
```

On a healthy service with no prior state it records `up` and sends **no**
alert. The state file should now contain `up`:

```bash
cat ~/.local/state/movieclub/komodo-health.state
```

### Test DOWN and recovery without stopping production

Point the script at a URL that returns a non-2xx response:

```bash
HEALTHCHECK_URL=https://leffaseura.club/api/health-does-not-exist \
  bash scripts/komodo-healthcheck.sh
```

This should send a `CRITICAL` alert and exit `1`. Then run the normal check to
send the `OK` recovery:

```bash
bash scripts/komodo-healthcheck.sh
```

The second command should send an `OK` alert and exit `0`.

> These are real alerts. Tell the on-call channel before doing this.

To test through launchd:

```bash
launchctl kickstart -k "gui/$(id -u)/com.movieclub.healthcheck"
tail -n 20 ~/Library/Logs/movieclub/healthcheck.stdout.log
```

## Behaviour details

- **Initial state**: if the first check is UP, state is written and no
  recovery alert is sent. If the first check is DOWN, a `CRITICAL` alert is
  sent (then state is written only after Komodo confirms success).
- **No spam**: a sustained outage or a sustained healthy period produces one
  alert per transition, not one per minute.
- **Retry**: if `SendAlert` fails (network error, HTTP error, or Komodo returns
  `success: false`), the previous state is kept and the next minute's run
  retries the same transition.
- **Overlap protection**: a lock directory next to the state file prevents two
  runs from overlapping. Locks older than 5 minutes are treated as stale and
  removed.
- **State reset**: delete the state file to forget the last known state. The
  next UP check is silent again; the next DOWN check alerts.

## Troubleshooting

| Symptom                                                   | Likely cause / fix                                                                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `credential file ... is accessible by group/other`        | `chmod 600 ~/.config/movieclub/komodo-health.env`                                                                                                                      |
| `KOMODO_* is not set`                                     | Missing required variable in the env file                                                                                                                              |
| `Could not find any valid alerters to send to` (HTTP 400) | Alerter disabled, `Custom` not in its Alert Types, or the API user lacks Read/Execute on the alerter                                                                   |
| `success:false` with a `Send Error` log                   | Komodo could not deliver to the alerter endpoint (bad webhook URL, network, etc.). Use the alerter's Test button.                                                      |
| No alert when the service was already down                | Expected: only transitions alert. Check the state file.                                                                                                                |
| Script not running every minute                           | `launchctl print "gui/$(id -u)/com.movieclub.healthcheck"`; check the logs. User LaunchAgents require the user to be logged in (the deployment uses macOS auto-login). |
| Stale lock                                                | The script removes locks older than 5 minutes. To force it, remove `<state-file>.lock`.                                                                                |

## Docker log rotation

`docker-compose.prod.yml` configures the `json-file` driver with rotation for
both the app and Postgres:

```yaml
logging:
  driver: json-file
  options:
    max-size: '10m'
    max-file: '3'
```

`docker-compose.app-only.yml` has the same rotation for the app container.
This caps Docker's own logs at ~30 MB per container (3 × 10 MB). It does not
affect the LaunchAgent log files in `~/Library/Logs/movieclub`.

## Uninstall

```bash
launchctl bootout "gui/$(id -u)/com.movieclub.healthcheck"
rm ~/Library/LaunchAgents/com.movieclub.healthcheck.plist
```

Optionally remove the state file:

```bash
rm -f ~/.local/state/movieclub/komodo-health.state
```

## Web Vitals telemetry

Production builds collect document-level Core Web Vitals and store a small,
privacy-safe sample in Postgres. Collection runs only in production builds
(`import.meta.env.PROD`) and is skipped entirely when the browser sends Do Not
Track or Global Privacy Control. The reporter dynamically imports
[`web-vitals`](https://github.com/GoogleChrome/web-vitals), captures the route
bucket once from the initial document load (SPA navigations cannot change it),
and sends at most five samples per request with `fetch` (`keepalive`,
`credentials: "omit"`). Every failure is ignored so telemetry cannot affect the
page.

### What is stored

The `web_vital_metric` table stores only:

| Column            | Meaning                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| `id`              | Opaque row identifier, not linked to a person or metric run.           |
| `name`            | `CLS`, `FCP`, `INP`, `LCP`, or `TTFB`.                                 |
| `value`           | Metric value in milliseconds, or unitless for `CLS`.                   |
| `rating`          | Server-derived `good`, `needs-improvement`, or `poor`.                 |
| `route_key`       | Allowlisted coarse route bucket (`landing`, `home`, `discover`, etc.). |
| `navigation_type` | Navigation Timing value (`navigate`, `reload`, and so on).             |
| `bucket_start`    | Server-derived start of the UTC hour when the sample arrived.          |

The following are never collected or stored: full pathname, query string,
referrer, user ID, session ID, IP address, user agent, viewport, web-vitals
metric instance `id`, metric entries, or attribution data. Dynamic route IDs are
discarded when the pathname is reduced to a coarse bucket.

### Endpoint behaviour

`POST /api/web-vitals` is public but deliberately narrow:

- Request `Content-Type` must be `application/json`.
- The body is read as a stream and hard-capped at 4 KiB; a batch holds 1–5
  samples.
- Validation is a strict Zod allowlist with per-metric ranges and no extra
  properties.
- Same-origin protection compares the `Origin` host to the first
  `X-Forwarded-Host` value (or `Host` when no proxy header exists), so it works
  behind the configured reverse proxy without accepting either header as an
  alternate. Requests whose `Sec-Fetch-Site` is `cross-site` (or `same-site`)
  are rejected.
- No CORS headers are returned.
- A process-wide fixed-window limit allows 600 requests per minute. It is not
  keyed by IP, user, session, or any other client identifier.
- A second process-wide guard caps persisted observations at 10,000 per UTC day;
  over-budget samples are silently dropped to bound storage growth.
- Both guards are process-local and reset when the app process restarts. This is
  appropriate for the current single-container deployment; if the app is scaled
  to multiple instances, move the limits to shared storage or an edge proxy.
- A successful request returns `204` with `Cache-Control: no-store`, including
  when database persistence fails. Rejections return `400`, `403`, `413`, `415`,
  or `429` with a JSON `{ "error": "..." }` body and no CORS headers.

Telemetry is best effort. During the deploy window where the app restarts
before migrations run, the table may not exist yet: the insert fails, the sample
is dropped, and the error is logged at most once per process. The same applies
to any other database insert failure. A rejected request or a dropped sample
never affects page rendering.

### Retention

The POST handler opportunistically deletes rows older than 30 days, at most
once per process per hour. Prune failures are caught and logged at most once
per process. The `bucket_start` index keeps both the range scan and the delete
bounded.

### Migration

Apply the hand-written migration with the normal command:

```bash
pnpm db:migrate
# or
pnpm exec drizzle-kit migrate
```

**Migration metadata caveat:** `drizzle/meta/_journal.json` previously ended at
`0016`, while a stale, git-ignored `drizzle/meta/0018_snapshot.json` exists in
some working copies. This change adds the next journal entry, `0017` (idx `16`),
and the hand-written SQL file `drizzle/0017_web_vital_metric.sql`. Snapshots were
intentionally **not** regenerated. Do not run `drizzle-kit generate` until that
stale snapshot is removed or the metadata is reconciled; `drizzle-kit migrate`
only needs the journal and SQL files.

### Example queries

LCP p75 by route for the last seven days:

```sql
SELECT
  route_key,
  count(*) AS samples,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75_lcp_ms
FROM web_vital_metric
WHERE name = 'LCP'
  AND bucket_start >= now() - interval '7 days'
GROUP BY route_key
ORDER BY p75_lcp_ms DESC;
```

Rating distribution for every metric in the last 24 hours:

```sql
SELECT
  name,
  rating,
  count(*) AS samples
FROM web_vital_metric
WHERE bucket_start >= now() - interval '24 hours'
GROUP BY name, rating
ORDER BY name, rating;
```

Slowest routes by INP p75:

```sql
SELECT
  route_key,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75_inp_ms
FROM web_vital_metric
WHERE name = 'INP'
  AND bucket_start >= now() - interval '7 days'
GROUP BY route_key
ORDER BY p75_inp_ms DESC;
```

Manual retention sweep (the app performs this hourly on its own):

```sql
DELETE FROM web_vital_metric
WHERE bucket_start < now() - interval '30 days';
```
