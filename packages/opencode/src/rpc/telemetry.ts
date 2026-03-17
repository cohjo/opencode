import { Instance } from '../project/instance'
import { Bus } from '../bus'
import { FileWatcher } from '../file/watcher'
import { LSP } from '../lsp'
import { LSPClient } from '../lsp/client'
import { exec } from 'child_process'
import { promisify } from 'util'
import type { LspDiagnosticWire, TelemetryStateWire } from './types'

const execAsync = promisify(exec)

export class Telemetry {
  private static tracker: TelemetryDeltaTracker | null = null

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
    try {
      const { stdout } = await execAsync('git diff', { cwd })
      uncommittedDiffs = stdout
    } catch {
      // Ignore if not a git repo or no diffs
    }

    const tracker = Telemetry.getTracker()
    tracker.ensureSubscribed(cwd)
    const deltas = tracker.consume(cwd)

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
      changed_files: deltas.changedFiles,
      removed_files: deltas.removedFiles,
    }
  }

  private static getTracker(): TelemetryDeltaTracker {
    if (!Telemetry.tracker) {
      Telemetry.tracker = new TelemetryDeltaTracker()
    }
    return Telemetry.tracker
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

class TelemetryDeltaTracker {
  private changed = new Set<string>()
  private removed = new Set<string>()
  private subscribed = false

  ensureSubscribed(cwd: string): void {
    if (this.subscribed) return
    try {
      Bus.subscribe(FileWatcher.Event.Updated, ({ properties }) => {
        const rel = this.toRelative(cwd, properties.file)
        if (!rel) return
        if (properties.event === 'unlink') {
          this.changed.delete(rel)
          this.removed.add(rel)
          return
        }
        this.removed.delete(rel)
        this.changed.add(rel)
      })

      Bus.subscribe(LSPClient.Event.Diagnostics, ({ properties }) => {
        const rel = this.toRelative(cwd, properties.path)
        if (!rel) return
        this.removed.delete(rel)
        this.changed.add(rel)
      })

      this.subscribed = true
    } catch {
      // Bus may be unavailable outside normal instance context
    }
  }

  consume(cwd: string): { changedFiles: string[]; removedFiles: string[] } {
    const changedFiles = [...this.changed].filter((file) => this.isWithinCwd(cwd, file))
    const removedFiles = [...this.removed].filter((file) => this.isWithinCwd(cwd, file))
    this.changed.clear()
    this.removed.clear()
    return { changedFiles, removedFiles }
  }

  private toRelative(cwd: string, filePath: string): string | null {
    if (!filePath) return null
    const normalized = filePath.replaceAll('\\', '/')
    if (normalized.startsWith('./')) return normalized
    if (normalized.startsWith('/')) {
      if (!normalized.startsWith(cwd.replaceAll('\\', '/'))) return null
      const rel = normalized.slice(cwd.length).replace(/^\//, '')
      return rel ? `./${rel}` : null
    }
    return `./${normalized.replace(/^\.\//, '')}`
  }

  private isWithinCwd(cwd: string, relativePath: string): boolean {
    return relativePath.startsWith('./') && !relativePath.includes('..') && cwd.length > 0
  }
}

function normalizeRepoPath(input: string): string {
  const cleaned = input.trim()
  if (!cleaned) return cleaned
  if (cleaned.startsWith('./')) return cleaned
  return `./${cleaned}`
}
