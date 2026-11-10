import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { extname, join, relative, sep } from "node:path"

const toPosix = (p) => p.split(sep).join("/")

export const REQUIRED_FILES = [
  "manifest.json",
  "colors.json",
  "typography.json",
  "logos.json",
  "tokens.json",
  "motion.json",
  "fonts.json",
]

export const REQUIRED_DIRS = ["docs", "fixtures"]

/** Theme packages must be declarative only (AC-8.2 / REPOS.md). */
export const FORBIDDEN_CODE_EXTENSIONS = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".wasm",
  ".py",
  ".rb",
  ".sh",
  ".bat",
  ".ps1",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
])

export const walkFiles = (dir, out = []) => {
  if (!existsSync(dir)) {
    return out
  }
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      walkFiles(full, out)
    } else {
      out.push(full)
    }
  }
  return out
}

export const assertLayout = (packageDir) => {
  const errors = []
  for (const file of REQUIRED_FILES) {
    if (!existsSync(join(packageDir, file))) {
      errors.push(`missing file ${file}`)
    }
  }
  for (const dir of REQUIRED_DIRS) {
    const full = join(packageDir, dir)
    if (!existsSync(full) || !statSync(full).isDirectory()) {
      errors.push(`missing directory ${dir}/`)
      continue
    }
    if (readdirSync(full).length < 1) {
      errors.push(`empty directory ${dir}/`)
    }
  }
  return errors
}

export const findExecutableFiles = (packageDir) =>
  walkFiles(packageDir).filter((f) =>
    FORBIDDEN_CODE_EXTENSIONS.has(extname(f).toLowerCase())
  )

export const listFixtureJson = (packageDir) => {
  const dir = join(packageDir, "fixtures")
  if (!existsSync(dir)) {
    return []
  }
  return readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .map((n) => join(dir, n))
}

export const readJson = (path) => JSON.parse(readFileSync(path, "utf8"))

export const relPosix = (root, full) => toPosix(relative(root, full))
