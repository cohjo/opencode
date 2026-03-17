import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import { promisify } from "util"
import type { CommandResultWire, ToolCommandWire } from "./types"
import { validateToolCommand } from "./validation"

const execAsync = promisify(exec)

export async function executeToolCommand(input: { sessionID: string; cmd: ToolCommandWire }): Promise<CommandResultWire> {
  const sessionID = input.sessionID
  const cmd = validateToolCommand(input.cmd)
  const commandID = cmd.command_id ?? ""
  const commandKind = cmd.command ?? ""

  try {
    if (commandKind === "execute_bash") {
      const payload = cmd.execute_bash ?? {}
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

    if (commandKind === "apply_patch") {
      const payload = cmd.apply_patch ?? {}
      const filePath = payload.file_path
      const patchContent = payload.patch_content ?? ""
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

    if (commandKind === "read_file") {
      const payload = cmd.read_file ?? {}
      const filePath = payload.file_path
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
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string }
    return {
      session_id: sessionID,
      command_id: commandID,
      success: false,
      output: `${err.stdout ?? ""}${err.stderr ?? ""}`.trim(),
      error: err.message ?? String(error),
    }
  }
}
