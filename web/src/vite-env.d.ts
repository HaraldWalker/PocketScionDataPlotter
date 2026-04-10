/// <reference types="vite/client" />

interface Window {
  // Web MIDI API types
  navigator: Navigator & {
    requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<MIDIAccess>
  }
}

interface MIDIAccess {
  inputs: MIDIInputMap
  outputs: MIDIOutputMap
  onstatechange: (event: MIDIConnectionEvent) => void
  addEventListener(type: 'statechange', listener: (event: MIDIConnectionEvent) => void): void
  removeEventListener(type: 'statechange', listener: (event: MIDIConnectionEvent) => void): void
}

interface MIDIInputMap extends ReadonlyMap<string, MIDIInput> {}
interface MIDIOutputMap extends ReadonlyMap<string, MIDIOutput> {}

interface MIDIInput extends MIDIPort {
  onmidimessage: (event: MIDIMessageEvent) => void
  addEventListener(type: 'midimessage', listener: (event: MIDIMessageEvent) => void): void
  removeEventListener(type: 'midimessage', listener: (event: MIDIMessageEvent) => void): void
}

interface MIDIOutput extends MIDIPort {
  send(data: number[], timestamp?: number): void
}

interface MIDIPort {
  id: string
  manufacturer?: string
  name?: string
  type: 'input' | 'output'
  version?: string
  state: 'connected' | 'disconnected'
  connection: 'open' | 'closed' | 'pending'
  onstatechange: (event: MIDIConnectionEvent) => void
  open(): Promise<void>
  close(): Promise<void>
}

interface MIDIMessageEvent {
  data: Uint8Array
  timestamp: number
}

interface MIDIConnectionEvent {
  port: MIDIPort
}
