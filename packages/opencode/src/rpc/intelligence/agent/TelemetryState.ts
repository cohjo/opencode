// Original file: src/rpc/agent.proto

import type { LspDiagnostic as _intelligence_agent_LspDiagnostic, LspDiagnostic__Output as _intelligence_agent_LspDiagnostic__Output } from '../../intelligence/agent/LspDiagnostic';

export interface TelemetryState {
  'sessionId'?: (string);
  'userPrompt'?: (string);
  'cwd'?: (string);
  'terminalStdout'?: (string);
  'lspDiagnostics'?: (_intelligence_agent_LspDiagnostic)[];
  'fileTree'?: (string);
  'uncommittedDiffs'?: (string);
  'changedFiles'?: (string)[];
  'removedFiles'?: (string)[];
}

export interface TelemetryState__Output {
  'sessionId'?: (string);
  'userPrompt'?: (string);
  'cwd'?: (string);
  'terminalStdout'?: (string);
  'lspDiagnostics'?: (_intelligence_agent_LspDiagnostic__Output)[];
  'fileTree'?: (string);
  'uncommittedDiffs'?: (string);
  'changedFiles'?: (string)[];
  'removedFiles'?: (string)[];
}
