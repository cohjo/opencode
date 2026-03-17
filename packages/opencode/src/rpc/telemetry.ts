import { Instance } from '../project/instance'
import { LSP } from '../lsp'
import type { LSPClient } from '../lsp/client'
import { exec } from 'child_process'
import { promisify } from 'util'
import type { LspDiagnosticWire, TelemetryStateWire } from './types'

const execAsync = promisify(exec)

export class Telemetry {
  static async harvest(sessionID: string, userPrompt: string): Promise<TelemetryStateWire> {
    let cwd = process.cwd()
    try {
      cwd = Instance.worktree
    } catch {
      // Not initialized in test
    }

    let lspDiagnostics: LspDiagnosticWire[] = []
    try {
      const diagnosticsByPath = await LSP.diagnostics()
      for (const [filePath, diagnostics] of Object.entries(diagnosticsByPath)) {
        for (const diagnostic of diagnostics) {
          lspDiagnostics.push(mapDiagnostic(filePath, diagnostic))
        }
      }
    } catch (e) {
      console.error('Failed to get LSP diagnostics', e)
    }

    let uncommittedDiffs = ''
    let changedFiles: string[] = []
    let removedFiles: string[] = []
    try {
      const { stdout } = await execAsync('git diff', { cwd })
      uncommittedDiffs = stdout

      const deltas = await collectGitFileDeltas(cwd)
      changedFiles = deltas.changedFiles
      removedFiles = deltas.removedFiles
    } catch {
      // Ignore if not a git repo or no diffs
    }

    let fileTree = ''
    try {
      const { stdout } = await execAsync('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | head -n 1000', { cwd })
      fileTree = stdout
    } catch {}

    return {
      session_id: sessionID,
      user_prompt: userPrompt,
      cwd,
      terminal_stdout: '',
      lsp_diagnostics: lspDiagnostics,
      file_tree: fileTree,
      uncommitted_diffs: uncommittedDiffs,
      changed_files: changedFiles,
      removed_files: removedFiles,
    }
  }
}

function mapDiagnostic(filePath: string, diagnostic: LSPClient.Diagnostic): LspDiagnosticWire {
  return {
    file: filePath,
    message: diagnostic.message,
    line: diagnostic.range.start.line + 1,
    severity: String(diagnostic.severity ?? 'ERROR'),
  }
}

async function collectGitFileDeltas(cwd: string): Promise<{
  changedFiles: string[]
  removedFiles: string[]
}> {
  const changed = new Set<string>()
  const removed = new Set<string>()

  const { stdout } = await execAsync('git status --porcelain --untracked-files=all', { cwd })
  for (const raw of stdout.split('\n')) {
    const line = raw.trimEnd()
    if (!line) continue

    if (line.startsWith('?? ')) {
      changed.add(normalizeRepoPath(line.slice(3)))
      continue
    }

    const status = line.slice(0, 2)
    const payload = line.slice(3)
    if (!payload) continue

    if (payload.includes(' -> ')) {
      const [fromPath, toPath] = payload.split(' -> ', 2)
      if (status.includes('D')) {
        removed.add(normalizeRepoPath(fromPath))
      }
      changed.add(normalizeRepoPath(toPath))
      continue
    }

    if (status.includes('D')) {
      removed.add(normalizeRepoPath(payload))
      continue
    }

    changed.add(normalizeRepoPath(payload))
  }

  return {
    changedFiles: [...changed],
    removedFiles: [...removed],
  }
}

function normalizeRepoPath(input: string): string {
  const cleaned = input.trim()
  if (!cleaned) return cleaned
  if (cleaned.startsWith('./')) return cleaned
  return `./${cleaned}`
}
