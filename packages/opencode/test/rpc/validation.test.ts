import { describe, expect, test } from "bun:test"
import { validateToolCommand } from "../../src/rpc/validation"

describe("rpc.validation", () => {
  test("accepts execute_bash with payload", () => {
    const command = validateToolCommand({
      command: "execute_bash",
      execute_bash: { command: "ls -la", workdir: "." },
    })
    expect(command.command).toBe("execute_bash")
  })

  test("rejects command with missing payload", () => {
    expect(() =>
      validateToolCommand({
        command: "apply_patch",
      }),
    ).toThrow()
  })

  test("rejects unknown command shape", () => {
    expect(() =>
      validateToolCommand({
        command: "execute_bash",
        execute_bash: { command: "" },
      }),
    ).toThrow()
  })
})
