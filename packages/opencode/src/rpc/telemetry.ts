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
    const deltas = tracker.snapshot(cwd)

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

  static markDelivered(state: TelemetryStateWire): void {
    const tracker = Telemetry.getTracker()
    tracker.acknowledge(
      state.cwd,
      state.changed_files,
      state.removed_files,
    )
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
  private changedByCwd = new Map<string, Set<string>>()
  private removedByCwd = new Map<string, Set<string>>()
  private subscribed = false

  ensureSubscribed(cwd: string): void {
    if (this.subscribed) return
    try {
      Bus.subscribe(FileWatcher.Event.Updated, ({ properties }) => {
        const rel = this.toRelative(cwd, properties.file)
        if (!rel) return
        const changed = this.getChangedSet(cwd)
        const removed = this.getRemovedSet(cwd)
        if (properties.event === 'unlink') {
          changed.delete(rel)
          removed.add(rel)
          return
        }
        removed.delete(rel)
        changed.add(rel)
      })

      Bus.subscribe(LSPClient.Event.Diagnostics, ({ properties }) => {
        const rel = this.toRelative(cwd, properties.path)
        if (!rel) return
        const changed = this.getChangedSet(cwd)
        const removed = this.getRemovedSet(cwd)
        removed.delete(rel)
        changed.add(rel)
      })

      this.subscribed = true
    } catch {
      // Bus may be unavailable outside normal instance context
    }
  }

  snapshot(cwd: string): { changedFiles: string[]; removedFiles: string[] } {
    const changedFiles = [...(this.changedByCwd.get(cwd) ?? [])].filter((file) => this.isWithinCwd(cwd, file))
    const removedFiles = [...(this.removedByCwd.get(cwd) ?? [])].filter((file) => this.isWithinCwd(cwd, file))
    return { changedFiles, removedFiles }
  }

  acknowledge(cwd: string, changedFiles: string[], removedFiles: string[]): void {
    const changed = this.changedByCwd.get(cwd)
    const removed = this.removedByCwd.get(cwd)
    if (changed) {
      for (const file of changedFiles) {
        changed.delete(file)
      }
    }
    if (removed) {
      for (const file of removedFiles) {
        removed.delete(file)
      }
    }
  }

  private getChangedSet(cwd: string): Set<string> {
    const existing = this.changedByCwd.get(cwd)
    if (existing) return existing
    const created = new Set<string>()
    this.changedByCwd.set(cwd, created)
    return created
  }

  private getRemovedSet(cwd: string): Set<string> {
    const existing = this.removedByCwd.get(cwd)
    if (existing) return existing
    const created = new Set<string>()
    this.removedByCwd.set(cwd, created)
    return created
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
