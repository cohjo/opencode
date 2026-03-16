import { Instance } from '../project/instance'
import { LSP } from '../lsp'
import type { TelemetryState } from './intelligence/agent/TelemetryState'
import { IntelligenceClient } from './client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class Telemetry {
  static client = new IntelligenceClient()

  static async harvest(sessionID: string, userPrompt: string): Promise<any> {
    let cwd = process.cwd()
    try {
      cwd = Instance.worktree
    } catch (e) {
      // Not initialized in test
    }

    // Get LSP diagnostics
    let lspDiagnostics: any[] = []
    try {
      const diags: any = await LSP.diagnostics()
      lspDiagnostics = diags.map((d: any) => ({
        file: d.file,
        message: d.message,
        line: d.line,
        severity: typeof d.severity === 'string' ? d.severity : 'ERROR'
      }))
    } catch (e) {
      console.error('Failed to get LSP diagnostics', e)
    }

    // Get uncommitted diffs
    let uncommitted_diffs = ''
    try {
      const { stdout } = await execAsync('git diff', { cwd })
      uncommitted_diffs = stdout
    } catch (e) {
      // Ignore if not a git repo or no diffs
    }

    // Get File Tree
    let file_tree = ''
    try {
      // Very basic file tree using find (excluding node_modules and .git)
      const { stdout } = await execAsync('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | head -n 1000', { cwd })
      file_tree = stdout
    } catch (e) {
    }

    return {
      session_id: sessionID,
      user_prompt: userPrompt,
      cwd,
      terminal_stdout: '', // We can pipe TUI output here later
      lsp_diagnostics: lspDiagnostics,
      file_tree,
      uncommitted_diffs
    }
  }
}
