export type TelemetryStateWire = {
  session_id: string
  user_prompt: string
  cwd: string
  terminal_stdout: string
  lsp_diagnostics: LspDiagnosticWire[]
  file_tree: string
  uncommitted_diffs: string
}

export type LspDiagnosticWire = {
  file: string
  message: string
  line: number
  severity: string
}

export type ExecuteBashWire = {
  command?: string
  workdir?: string
}

export type ApplyPatchWire = {
  file_path?: string
  patch_content?: string
}

export type ReadFileWire = {
  file_path?: string
}

export type ToolCommandKind = "execute_bash" | "apply_patch" | "read_file"

export type ToolCommandWire = {
  command_id?: string
  command?: ToolCommandKind
  execute_bash?: ExecuteBashWire
  apply_patch?: ApplyPatchWire
  read_file?: ReadFileWire
}

export type CommandResultWire = {
  session_id: string
  command_id: string
  success: boolean
  output: string
  error: string
}
