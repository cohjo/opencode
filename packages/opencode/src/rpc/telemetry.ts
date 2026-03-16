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
    try {
      const { stdout } = await execAsync('git diff', { cwd })
      uncommittedDiffs = stdout
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
