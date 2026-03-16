// Original file: src/rpc/agent.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CommandResult as _intelligence_agent_CommandResult, CommandResult__Output as _intelligence_agent_CommandResult__Output } from '../../intelligence/agent/CommandResult';
import type { ToolCommand as _intelligence_agent_ToolCommand, ToolCommand__Output as _intelligence_agent_ToolCommand__Output } from '../../intelligence/agent/ToolCommand';

export interface ExecutionServiceClient extends grpc.Client {
  StreamCommands(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_intelligence_agent_CommandResult, _intelligence_agent_ToolCommand__Output>;
  StreamCommands(options?: grpc.CallOptions): grpc.ClientDuplexStream<_intelligence_agent_CommandResult, _intelligence_agent_ToolCommand__Output>;
  streamCommands(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_intelligence_agent_CommandResult, _intelligence_agent_ToolCommand__Output>;
  streamCommands(options?: grpc.CallOptions): grpc.ClientDuplexStream<_intelligence_agent_CommandResult, _intelligence_agent_ToolCommand__Output>;
  
}

export interface ExecutionServiceHandlers extends grpc.UntypedServiceImplementation {
  StreamCommands: grpc.handleBidiStreamingCall<_intelligence_agent_CommandResult__Output, _intelligence_agent_ToolCommand>;
  
}

export interface ExecutionServiceDefinition extends grpc.ServiceDefinition {
  StreamCommands: MethodDefinition<_intelligence_agent_CommandResult, _intelligence_agent_ToolCommand, _intelligence_agent_CommandResult__Output, _intelligence_agent_ToolCommand__Output>
}
