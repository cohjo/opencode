import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { ApplyPatch as _intelligence_agent_ApplyPatch, ApplyPatch__Output as _intelligence_agent_ApplyPatch__Output } from './intelligence/agent/ApplyPatch';
import type { CommandResult as _intelligence_agent_CommandResult, CommandResult__Output as _intelligence_agent_CommandResult__Output } from './intelligence/agent/CommandResult';
import type { ExecuteBash as _intelligence_agent_ExecuteBash, ExecuteBash__Output as _intelligence_agent_ExecuteBash__Output } from './intelligence/agent/ExecuteBash';
import type { ExecutionServiceClient as _intelligence_agent_ExecutionServiceClient, ExecutionServiceDefinition as _intelligence_agent_ExecutionServiceDefinition } from './intelligence/agent/ExecutionService';
import type { LspDiagnostic as _intelligence_agent_LspDiagnostic, LspDiagnostic__Output as _intelligence_agent_LspDiagnostic__Output } from './intelligence/agent/LspDiagnostic';
import type { PingRequest as _intelligence_agent_PingRequest, PingRequest__Output as _intelligence_agent_PingRequest__Output } from './intelligence/agent/PingRequest';
import type { PingResponse as _intelligence_agent_PingResponse, PingResponse__Output as _intelligence_agent_PingResponse__Output } from './intelligence/agent/PingResponse';
import type { ReadFile as _intelligence_agent_ReadFile, ReadFile__Output as _intelligence_agent_ReadFile__Output } from './intelligence/agent/ReadFile';
import type { TelemetryResponse as _intelligence_agent_TelemetryResponse, TelemetryResponse__Output as _intelligence_agent_TelemetryResponse__Output } from './intelligence/agent/TelemetryResponse';
import type { TelemetryServiceClient as _intelligence_agent_TelemetryServiceClient, TelemetryServiceDefinition as _intelligence_agent_TelemetryServiceDefinition } from './intelligence/agent/TelemetryService';
import type { TelemetryState as _intelligence_agent_TelemetryState, TelemetryState__Output as _intelligence_agent_TelemetryState__Output } from './intelligence/agent/TelemetryState';
import type { ToolCommand as _intelligence_agent_ToolCommand, ToolCommand__Output as _intelligence_agent_ToolCommand__Output } from './intelligence/agent/ToolCommand';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  intelligence: {
    agent: {
      ApplyPatch: MessageTypeDefinition<_intelligence_agent_ApplyPatch, _intelligence_agent_ApplyPatch__Output>
      CommandResult: MessageTypeDefinition<_intelligence_agent_CommandResult, _intelligence_agent_CommandResult__Output>
      ExecuteBash: MessageTypeDefinition<_intelligence_agent_ExecuteBash, _intelligence_agent_ExecuteBash__Output>
      ExecutionService: SubtypeConstructor<typeof grpc.Client, _intelligence_agent_ExecutionServiceClient> & { service: _intelligence_agent_ExecutionServiceDefinition }
      LspDiagnostic: MessageTypeDefinition<_intelligence_agent_LspDiagnostic, _intelligence_agent_LspDiagnostic__Output>
      PingRequest: MessageTypeDefinition<_intelligence_agent_PingRequest, _intelligence_agent_PingRequest__Output>
      PingResponse: MessageTypeDefinition<_intelligence_agent_PingResponse, _intelligence_agent_PingResponse__Output>
      ReadFile: MessageTypeDefinition<_intelligence_agent_ReadFile, _intelligence_agent_ReadFile__Output>
      TelemetryResponse: MessageTypeDefinition<_intelligence_agent_TelemetryResponse, _intelligence_agent_TelemetryResponse__Output>
      TelemetryService: SubtypeConstructor<typeof grpc.Client, _intelligence_agent_TelemetryServiceClient> & { service: _intelligence_agent_TelemetryServiceDefinition }
      TelemetryState: MessageTypeDefinition<_intelligence_agent_TelemetryState, _intelligence_agent_TelemetryState__Output>
      ToolCommand: MessageTypeDefinition<_intelligence_agent_ToolCommand, _intelligence_agent_ToolCommand__Output>
    }
  }
}

