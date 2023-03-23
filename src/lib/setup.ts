// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= "development"

import "@sapphire/plugin-api/register"
import "@sapphire/plugin-editable-commands/register"
import "@sapphire/plugin-logger/register"
import { setup } from "@skyra/env-utilities"
import * as colorette from "colorette"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { inspect } from "util"

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const rootDir = join(__dirname, "..", "..")
const srcDir = join(rootDir, "src")

// Read env var
setup({ path: join(srcDir, ".env") })

// Set default inspection depth
inspect.defaultOptions.depth = 1

// Enable colorette
colorette.createColors({ useColor: true })
