import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { ProtoGrpcType } from './agent'

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
}
