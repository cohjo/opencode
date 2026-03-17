import z from "zod"
import type { ToolCommandWire } from "./types"

const ExecuteBashSchema = z.object({
  command: z.string().min(1),
  workdir: z.string().min(1).optional(),
})

const ApplyPatchSchema = z.object({
  file_path: z.string().min(1),
  patch_content: z.string(),
})

const ReadFileSchema = z.object({
  file_path: z.string().min(1),
})

const ToolCommandSchema = z
  .object({
    command_id: z.string().optional(),
    command: z.enum(["execute_bash", "apply_patch", "read_file"]).optional(),
    execute_bash: ExecuteBashSchema.optional(),
    apply_patch: ApplyPatchSchema.optional(),
    read_file: ReadFileSchema.optional(),
  })
  .superRefine((value, ctx) => {
    const kind = value.command
    if (!kind) {
      ctx.addIssue({ code: "custom", message: "Missing command kind" })
      return
    }

    if (kind === "execute_bash" && !value.execute_bash) {
      ctx.addIssue({ code: "custom", message: "execute_bash payload required" })
    }
    if (kind === "apply_patch" && !value.apply_patch) {
      ctx.addIssue({ code: "custom", message: "apply_patch payload required" })
    }
    if (kind === "read_file" && !value.read_file) {
      ctx.addIssue({ code: "custom", message: "read_file payload required" })
    }
  })

export function validateToolCommand(input: ToolCommandWire): ToolCommandWire {
  return ToolCommandSchema.parse(input)
}
