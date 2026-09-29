#!/usr/bin/env node
import dotenv from 'dotenv'

import { createGunzip } from 'node:zlib'
import { createWriteStream } from 'node:fs'
import { mkdir, open, rename, rm } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(scriptDirectory, '..')
dotenv.config({ path: join(projectDirectory, '.env') })
const datasetUrl =
  process.env.IMDB_RATINGS_URL ?? 'https://datasets.imdbws.com/title.ratings.tsv.gz'
const configuredPath = process.env.IMDB_RATINGS_FILE ?? 'data/imdb/title.ratings.tsv'
const outputPath = isAbsolute(configuredPath)
  ? configuredPath
  : resolve(projectDirectory, configuredPath)
const temporaryPath = `${outputPath}.${process.pid}.${randomUUID()}.tmp`

async function main() {
  const outputDirectory = dirname(outputPath)
  await mkdir(outputDirectory, { recursive: true })

  console.log(`Downloading IMDb ratings from ${datasetUrl}`)
  const response = await fetch(datasetUrl, {
    headers: { 'user-agent': 'MovieClub IMDb ratings downloader' },
    signal: AbortSignal.timeout(10 * 60 * 1000),
  })

  if (!response.ok || !response.body) {
    throw new Error(`IMDb download failed: HTTP ${response.status} ${response.statusText}`)
  }

  let decompressedBytes = 0
  const countBytes = new Transform({
    transform(chunk, _encoding, callback) {
      decompressedBytes += chunk.length
      callback(null, chunk)
    },
  })

  await pipeline(
    Readable.fromWeb(response.body),
    createGunzip(),
    countBytes,
    createWriteStream(temporaryPath, { flags: 'wx' }),
  )

  const downloadedFile = await open(temporaryPath, 'r')
  try {
    const header = Buffer.alloc(128)
    const { bytesRead } = await downloadedFile.read(header, 0, header.length, 0)
    const firstLine = header.subarray(0, bytesRead).toString('utf8').split('\n', 1)[0]
    if (firstLine !== 'tconst\taverageRating\tnumVotes') {
      throw new Error(`Unexpected IMDb ratings TSV header: ${JSON.stringify(firstLine)}`)
    }
  } finally {
    await downloadedFile.close()
  }

  await rename(temporaryPath, outputPath)
  console.log(
    `Updated ${outputPath} (${(decompressedBytes / 1024 / 1024).toFixed(1)} MiB uncompressed)`,
  )
}

try {
  await main()
} catch (error) {
  await rm(temporaryPath, { force: true }).catch(() => {})
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
