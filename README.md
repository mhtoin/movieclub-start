Welcome to your new TanStack app!

# Getting Started

To run this application:

```bash
pnpm install
pnpm start
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router'
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/people',
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json() as Promise<{
      results: {
        name: string
      }[]
    }>
  },
  component: () => {
    const data = peopleRoute.useLoaderData()
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    )
  },
})
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ...

const queryClient = new QueryClient()

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
})
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from '@tanstack/react-query'

import './App.css'

function App() {
  const { data } = useQuery({
    queryKey: ['people'],
    queryFn: () =>
      fetch('https://swapi.dev/api/people')
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  })

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
pnpm add @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

function App() {
  const count = useStore(countStore)
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  )
}

export default App
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store, Derived } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
})
doubledStore.mount()

function App() {
  const count = useStore(countStore)
  const doubledCount = useStore(doubledStore)

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  )
}

export default App
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).


# Deployment (M1 Mac Mini)

The production stack runs in Docker on an Apple Silicon Mac mini:

```text
Nginx Proxy Manager on Proxmox -> Mac mini:3001 -> MovieClub app -> PostgreSQL
```

The production Compose file uses ARM64-compatible `node:24-alpine` and `postgres:16-alpine` images. Both containers use `restart: unless-stopped`, so Docker restarts them after crashes or reboots. The Mac launch agent starts the Compose stack after login.

## First-time Mac setup

Install Docker Desktop and start it:

```bash
brew install --cask docker
open -a Docker
```

In Docker Desktop, enable **Start Docker Desktop when you sign in**. Give Docker at least 4 GB of memory; 6 GB is reasonable if the AI workload is light.

Clone the repository and create a private production environment file outside the repository:

```bash
mkdir -p ~/src ~/.config/movieclub
git clone https://github.com/mhtoin/movieclub-start.git ~/src/movieclub-start
cd ~/src/movieclub-start
cp .env.production.example ~/.config/movieclub/.env.production
chmod 600 ~/.config/movieclub/.env.production
```

Edit `~/.config/movieclub/.env.production`. At minimum, set:

```dotenv
POSTGRES_USER=movieclub
POSTGRES_PASSWORD=<strong-database-password>
POSTGRES_DB=movieclub
SESSION_PASSWORD=<at-least-32-character-secret>
BASE_URL=https://movieclub.example.com
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM=MovieClub <noreply@movieclub.example.com>
VITE_TMDB_API_KEY=<tmdb-api-key>
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
VITE_SHORTLIST_CARD_VARIANT=default
```

Generate a session secret with:

```bash
openssl rand -hex 32
```

Start and migrate the stack manually for the first time:

```bash
cd ~/src/movieclub-start
MOVIECLUB_ENV_FILE="$HOME/.config/movieclub/.env.production" bash scripts/deploy.sh --skip-pull
```

Check it locally:

```bash
curl http://127.0.0.1:3001/api/health
```

## Automatic restart after login

Install the launch agent:

```bash
cd ~/src/movieclub-start
bash scripts/install-mac-launchd.sh
```

Check its status and logs:

```bash
launchctl print "gui/$(id -u)/com.movieclub.production"
tail -f ~/Library/Logs/movieclub/stderr.log
docker compose --env-file ~/.config/movieclub/.env.production -f docker-compose.prod.yml ps
```

The launch agent starts the containers once Docker Desktop is ready. Docker's `unless-stopped` policy then handles container crashes and Docker restarts.

`LaunchAgents` run after the Mac user logs in. For a fully unattended setup after power loss, enable automatic login for the dedicated Mac account, or replace this with a root `LaunchDaemon` after confirming Docker Desktop is available before the daemon starts.

## Nginx Proxy Manager

Keeping Nginx Proxy Manager on Proxmox is recommended. Give the Mac mini a DHCP reservation or static LAN address, then create a Proxy Host:

| Setting | Value |
|---------|-------|
| Domain | `movieclub.example.com` |
| Scheme | `http` |
| Forward hostname/IP | Mac mini LAN address, for example `192.168.1.50` |
| Forward port | `3001` |
| Websockets Support | Enabled |

Request a Let's Encrypt certificate in Nginx Proxy Manager and enable HTTP-to-HTTPS redirection. Do not expose port `3001` directly to the public internet. Update `BASE_URL` to the HTTPS domain and redeploy.

## PostgreSQL backups

The Docker volume is not a backup. Create a compressed dump outside the repository:

```bash
cd ~/src/movieclub-start
MOVIECLUB_ENV_FILE="$HOME/.config/movieclub/.env.production" \
  bash scripts/backup-postgres.sh "$HOME/movieclub-backups"
```

Schedule it with macOS launchd or cron, then copy the backup directory to another machine or cloud storage. A local-only backup does not protect against disk failure.

## GitHub Actions deployment

The workflow runs checks on GitHub-hosted infrastructure, then deploys only after a successful push to `main`.

Install a GitHub Actions self-hosted runner on the Mac:

1. Open **GitHub -> repository -> Settings -> Actions -> Runners -> New self-hosted runner**.
2. Select **macOS** and **ARM64**.
3. Follow GitHub's generated download and configuration commands.
4. Add the custom label `movieclub-production` when running `config.sh`.
5. Test it with `./run.sh`, then install it as a service:

```bash
./svc.sh install
./svc.sh start
```

The runner must be able to access Docker Desktop without `sudo`. Store the production environment file at:

```text
~/.config/movieclub/.env.production
```

The workflow uses that path and does not put secrets in GitHub or the repository. It checks out code with `clean: false`, runs `scripts/deploy.sh --skip-pull`, rebuilds the app image, waits for `/api/health`, and runs migrations.

For a manual deployment:

```bash
cd ~/src/movieclub-start
MOVIECLUB_ENV_FILE="$HOME/.config/movieclub/.env.production" bash scripts/deploy.sh
```
