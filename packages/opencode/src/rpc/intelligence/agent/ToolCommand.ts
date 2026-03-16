// Original file: src/rpc/agent.proto

import type { ExecuteBash as _intelligence_agent_ExecuteBash, ExecuteBash__Output as _intelligence_agent_ExecuteBash__Output } from '../../intelligence/agent/ExecuteBash';
import type { ApplyPatch as _intelligence_agent_ApplyPatch, ApplyPatch__Output as _intelligence_agent_ApplyPatch__Output } from '../../intelligence/agent/ApplyPatch';
import type { ReadFile as _intelligence_agent_ReadFile, ReadFile__Output as _intelligence_agent_ReadFile__Output } from '../../intelligence/agent/ReadFile';

export interface ToolCommand {
  'commandId'?: (string);
  'executeBash'?: (_intelligence_agent_ExecuteBash | null);
  'applyPatch'?: (_intelligence_agent_ApplyPatch | null);
  'readFile'?: (_intelligence_agent_ReadFile | null);
  'command'?: "executeBash"|"applyPatch"|"readFile";
}

export interface ToolCommand__Output {
  'commandId'?: (string);
  'executeBash'?: (_intelligence_agent_ExecuteBash__Output);
  'applyPatch'?: (_intelligence_agent_ApplyPatch__Output);
  'readFile'?: (_intelligence_agent_ReadFile__Output);
}
