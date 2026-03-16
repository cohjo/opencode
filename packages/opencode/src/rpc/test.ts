import { IntelligenceClient } from './client'
import { Telemetry } from './telemetry'

async function main() {
  const client = new IntelligenceClient()
  try {
    const pingRes = await client.ping('Hello from TS Shell!')
    console.log('Received ping response:', pingRes)

    console.log('Harvesting telemetry...')
    const state = await Telemetry.harvest('test-session', 'how do I build this project?')
    console.log('Harvested state:', { cwd: state.cwd, lspCount: state.lsp_diagnostics.length })

    const success = await client.streamTelemetry(state)
    console.log('StreamTelemetry success:', success)

    console.log('Starting StreamCommands...')
    client.streamCommands(async (cmd) => {
      console.log('Received command:', cmd)
      return {
        session_id: 'test-session',
        command_id: cmd.command_id,
        success: true,
        output: 'Simulated output',
        error: ''
      }
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

main()