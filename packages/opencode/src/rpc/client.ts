import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import type { ProtoGrpcType } from './agent'

const PROTO_PATH = path.join(import.meta.dir, 'agent.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType

export class IntelligenceClient {
  private telemetryClient: any
  private executionClient: any

  constructor(target: string = 'localhost:50051') {
    this.telemetryClient = new proto.intelligence.agent.TelemetryService(
      target,
      grpc.credentials.createInsecure()
    )
    this.executionClient = new proto.intelligence.agent.ExecutionService(
      target,
      grpc.credentials.createInsecure()
    )
  }

  ping(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.telemetryClient.Ping({ message }, (error: grpc.ServiceError | null, response: any) => {
        if (error) {
          reject(error)
        } else {
          resolve(response.message)
        }
      })
    })
  }

  streamTelemetry(state: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const call = this.telemetryClient.StreamTelemetry((error: grpc.ServiceError | null, response: any) => {
        if (error) {
          reject(error)
        } else {
          resolve(response.success)
        }
      })
      call.write(state)
      call.end()
    })
  }

  streamCommands(onCommand: (cmd: any) => Promise<any>): Promise<void> {
    const call = this.executionClient.StreamCommands()

    return new Promise((resolve, reject) => {
      call.on('data', async (cmd: any) => {
        try {
          const result = await onCommand(cmd)
          call.write(result)
        } catch (err: any) {
          call.write({
            session_id: cmd.session_id,
            command_id: cmd.command_id,
            success: false,
            output: '',
            error: err.message || String(err),
          })
        }
      })

      call.on('error', (err: any) => {
        console.error('Execution stream error:', err)
        reject(err)
      })

      call.on('end', () => {
        console.log('Execution stream ended')
        resolve()
      })
    })
  }
}
