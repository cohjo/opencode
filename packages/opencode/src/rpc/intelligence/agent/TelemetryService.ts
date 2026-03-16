// Original file: src/rpc/agent.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { PingRequest as _intelligence_agent_PingRequest, PingRequest__Output as _intelligence_agent_PingRequest__Output } from '../../intelligence/agent/PingRequest';
import type { PingResponse as _intelligence_agent_PingResponse, PingResponse__Output as _intelligence_agent_PingResponse__Output } from '../../intelligence/agent/PingResponse';
import type { TelemetryResponse as _intelligence_agent_TelemetryResponse, TelemetryResponse__Output as _intelligence_agent_TelemetryResponse__Output } from '../../intelligence/agent/TelemetryResponse';
import type { TelemetryState as _intelligence_agent_TelemetryState, TelemetryState__Output as _intelligence_agent_TelemetryState__Output } from '../../intelligence/agent/TelemetryState';

export interface TelemetryServiceClient extends grpc.Client {
  Ping(argument: _intelligence_agent_PingRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  Ping(argument: _intelligence_agent_PingRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  Ping(argument: _intelligence_agent_PingRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  Ping(argument: _intelligence_agent_PingRequest, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _intelligence_agent_PingRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _intelligence_agent_PingRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _intelligence_agent_PingRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  ping(argument: _intelligence_agent_PingRequest, callback: grpc.requestCallback<_intelligence_agent_PingResponse__Output>): grpc.ClientUnaryCall;
  
  StreamTelemetry(metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  StreamTelemetry(metadata: grpc.Metadata, callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  StreamTelemetry(options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  StreamTelemetry(callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  streamTelemetry(metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  streamTelemetry(metadata: grpc.Metadata, callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  streamTelemetry(options: grpc.CallOptions, callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  streamTelemetry(callback: grpc.requestCallback<_intelligence_agent_TelemetryResponse__Output>): grpc.ClientWritableStream<_intelligence_agent_TelemetryState>;
  
}

export interface TelemetryServiceHandlers extends grpc.UntypedServiceImplementation {
  Ping: grpc.handleUnaryCall<_intelligence_agent_PingRequest__Output, _intelligence_agent_PingResponse>;
  
  StreamTelemetry: grpc.handleClientStreamingCall<_intelligence_agent_TelemetryState__Output, _intelligence_agent_TelemetryResponse>;
  
}

export interface TelemetryServiceDefinition extends grpc.ServiceDefinition {
  Ping: MethodDefinition<_intelligence_agent_PingRequest, _intelligence_agent_PingResponse, _intelligence_agent_PingRequest__Output, _intelligence_agent_PingResponse__Output>
  StreamTelemetry: MethodDefinition<_intelligence_agent_TelemetryState, _intelligence_agent_TelemetryResponse, _intelligence_agent_TelemetryState__Output, _intelligence_agent_TelemetryResponse__Output>
}
