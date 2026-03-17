import { describe, expect, test } from "bun:test"
import { TelemetryDeltaTracker } from "../../src/rpc/telemetry"

describe("rpc telemetry delta tracker", () => {
  test("buffers changed and removed paths until acknowledged", () => {
    const tracker = new TelemetryDeltaTracker()
    const cwd = "/repo"

    tracker.recordUpdate(cwd, "/repo/src/a.ts", "change")
    tracker.recordUpdate(cwd, "/repo/src/b.ts", "add")
    tracker.recordUpdate(cwd, "/repo/src/b.ts", "unlink")

    const snapshot = tracker.snapshot(cwd)
    expect(snapshot.changedFiles).toEqual(["./src/a.ts"])
    expect(snapshot.removedFiles).toEqual(["./src/b.ts"])

    tracker.acknowledge(cwd, snapshot.changedFiles, snapshot.removedFiles)
    const afterAck = tracker.snapshot(cwd)
    expect(afterAck.changedFiles).toEqual([])
    expect(afterAck.removedFiles).toEqual([])
  })

  test("diagnostics mark file as changed and dedupe paths", () => {
    const tracker = new TelemetryDeltaTracker()
    const cwd = "/repo"

    tracker.recordDiagnostic(cwd, "/repo/src/a.ts")
    tracker.recordDiagnostic(cwd, "/repo/src/a.ts")

    const snapshot = tracker.snapshot(cwd)
    expect(snapshot.changedFiles).toEqual(["./src/a.ts"])
    expect(snapshot.removedFiles).toEqual([])
  })

  test("ignores paths outside cwd and blocks traversal segments", () => {
    const tracker = new TelemetryDeltaTracker()
    const cwd = "/repo"

    tracker.recordUpdate(cwd, "/other/src/a.ts", "change")
    tracker.recordUpdate(cwd, "../escape.ts", "change")

    const snapshot = tracker.snapshot(cwd)
    expect(snapshot.changedFiles).toEqual([])
    expect(snapshot.removedFiles).toEqual([])
  })
})
