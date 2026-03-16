import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import { promisify } from "util"

const execAsync = promisify(exec)

type CommandResult = {
  session_id: string
  command_id: string
  success: boolean
  output: string
  error: string
}

export async function executeToolCommand(input: { sessionID: string; cmd: any }): Promise<CommandResult> {
  const sessionID = input.sessionID
  const cmd = input.cmd
  const commandID = cmd.command_id ?? cmd.commandId ?? ""
  const commandKind = cmd.command ?? ""

  try {
    if (commandKind === "execute_bash" || commandKind === "executeBash") {
      const payload = cmd.execute_bash ?? cmd.executeBash ?? {}
      const command = payload.command ?? ""
      const workdir = payload.workdir ?? "."
      const cwd = path.isAbsolute(workdir) ? workdir : path.resolve(process.cwd(), workdir)

      const { stdout, stderr } = await execAsync(command, {
        cwd,
        maxBuffer: 10 * 1024 * 1024,
      })

      return {
        session_id: sessionID,
        command_id: commandID,
        success: true,
        output: `${stdout}${stderr}`.trim(),
        error: "",
      }
    }

    if (commandKind === "apply_patch" || commandKind === "applyPatch") {
      const payload = cmd.apply_patch ?? cmd.applyPatch ?? {}
      const filePath = payload.file_path ?? payload.filePath
      const patchContent = payload.patch_content ?? payload.patchContent ?? ""
      if (!filePath) throw new Error("apply_patch missing file_path")

      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
      await fs.mkdir(path.dirname(absolutePath), { recursive: true })
      await fs.writeFile(absolutePath, patchContent, "utf8")

      return {
        session_id: sessionID,
        command_id: commandID,
        success: true,
        output: `Wrote ${filePath}`,
        error: "",
      }
    }

    if (commandKind === "read_file" || commandKind === "readFile") {
      const payload = cmd.read_file ?? cmd.readFile ?? {}
      const filePath = payload.file_path ?? payload.filePath
      if (!filePath) throw new Error("read_file missing file_path")

      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
      const output = await fs.readFile(absolutePath, "utf8")

      return {
        session_id: sessionID,
        command_id: commandID,
        success: true,
        output,
        error: "",
      }
    }

    throw new Error(`Unsupported command type: ${commandKind}`)
  } catch (error: any) {
    return {
      session_id: sessionID,
      command_id: commandID,
      success: false,
      output: `${error?.stdout ?? ""}${error?.stderr ?? ""}`.trim(),
      error: error?.message ?? String(error),
    }
  }
}
