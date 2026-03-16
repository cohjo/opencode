import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import type { ProtoGrpcType } from './agent'
import type { CommandResultWire, TelemetryStateWire, ToolCommandWire } from './types'

type PingResponseWire = {
  message?: string
}

type TelemetryResponseWire = {
  success?: boolean
}

type TelemetryClientRuntime = {
  Ping(
    request: { message: string },
    callback: grpc.requestCallback<PingResponseWire>,
  ): grpc.ClientUnaryCall
  StreamTelemetry(
    callback: grpc.requestCallback<TelemetryResponseWire>,
  ): grpc.ClientWritableStream<TelemetryStateWire>
}

type ExecutionClientRuntime = {
  StreamCommands(): grpc.ClientDuplexStream<CommandResultWire, ToolCommandWire>
}

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
  private telemetryClient: TelemetryClientRuntime
  private executionClient: ExecutionClientRuntime

  constructor(target: string = 'localhost:50051') {
    const TelemetryCtor = proto.intelligence.agent.TelemetryService as unknown as new (
      address: string,
      credentials: grpc.ChannelCredentials,
    ) => TelemetryClientRuntime

    const ExecutionCtor = proto.intelligence.agent.ExecutionService as unknown as new (
      address: string,
      credentials: grpc.ChannelCredentials,
    ) => ExecutionClientRuntime

    this.telemetryClient = new TelemetryCtor(target, grpc.credentials.createInsecure())
    this.executionClient = new ExecutionCtor(target, grpc.credentials.createInsecure())
  }

  ping(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.telemetryClient.Ping({ message }, (error: grpc.ServiceError | null, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response?.message ?? '')
        }
      })
    })
  }

  streamTelemetry(state: TelemetryStateWire): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const call = this.telemetryClient.StreamTelemetry((error: grpc.ServiceError | null, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(Boolean(response?.success))
        }
      })
      call.write(state)
      call.end()
    })
  }

  streamCommands(onCommand: (cmd: ToolCommandWire) => Promise<CommandResultWire>): Promise<void> {
    const call = this.executionClient.StreamCommands()

    return new Promise((resolve, reject) => {
      call.on('data', async (cmd: ToolCommandWire) => {
        try {
          const result = await onCommand(cmd)
          call.write(result)
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          call.write({
            session_id: '',
            command_id: cmd.command_id ?? '',
            success: false,
            output: '',
            error: message,
          })
        }
      })

      call.on('error', (err: grpc.ServiceError) => {
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
