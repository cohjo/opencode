import { IntelligenceClient } from './client'

async function main() {
  const client = new IntelligenceClient()
  try {
    const response = await client.ping('Hello from TS Shell!')
    console.log('Received response:', response)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()