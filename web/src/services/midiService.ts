/**
 * MIDI Service - Web MIDI API wrapper
 * Handles MIDI device discovery and communication
 */

export interface MIDIDevice {
  id: string
  name: string
  manufacturer?: string
  state: 'connected' | 'disconnected'
}

export interface SysexMessage {
  data: Uint8Array
  timestamp: number
}

type SysexCallback = (message: SysexMessage) => void
type DeviceChangeCallback = (devices: MIDIDevice[]) => void

class MIDIService {
  private midiAccess: MIDIAccess | null = null
  private inputDevices: Map<string, MIDIInput> = new Map()
  private sysexCallbacks: Set<SysexCallback> = new Set()
  private deviceChangeCallbacks: Set<DeviceChangeCallback> = new Set()
  private isInitialized = false

  /**
   * Initialize Web MIDI API with sysex support
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('MIDI service already initialized')
      return true
    }

    try {
      // Check if Web MIDI API is supported
      if (!navigator.requestMIDIAccess) {
        console.error('Web MIDI API is not supported in this browser')
        return false
      }

      // Request MIDI access with sysex support
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: true })
      
      // Set up device change listener
      this.midiAccess.addEventListener('statechange', this.handleStateChange)
      
      // Scan for existing devices
      this.scanDevices()
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize MIDI service:', error)
      return false
    }
  }

  /**
   * Get list of available MIDI input devices
   */
  getInputDevices(): MIDIDevice[] {
    const devices: MIDIDevice[] = []
    
    if (!this.midiAccess) {
      return devices
    }

    for (const [, input] of this.midiAccess.inputs) {
      devices.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || undefined,
        state: input.state as 'connected' | 'disconnected',
      })
    }

    return devices
  }

  /**
   * Open a MIDI input device and start listening for messages
   */
  async openInput(deviceId: string): Promise<boolean> {
    if (!this.midiAccess) {
      console.error('MIDI service not initialized')
      return false
    }

    const input = this.midiAccess.inputs.get(deviceId)
    if (!input) {
      console.error(`Device ${deviceId} not found`)
      return false
    }

    try {
      await input.open()
      
      // Set up message listener
      input.addEventListener('midimessage', this.handleMidiMessage)
      
      this.inputDevices.set(deviceId, input)
      console.log(`Opened MIDI input: ${input.name}`)
      return true
    } catch (error) {
      console.error(`Failed to open MIDI input ${deviceId}:`, error)
      return false
    }
  }

  /**
   * Close a MIDI input device
   */
  async closeInput(deviceId: string): Promise<void> {
    const input = this.inputDevices.get(deviceId)
    if (!input) {
      return
    }

    try {
      input.removeEventListener('midimessage', this.handleMidiMessage)
      await input.close()
      this.inputDevices.delete(deviceId)
      console.log(`Closed MIDI input: ${input.name}`)
    } catch (error) {
      console.error(`Failed to close MIDI input ${deviceId}:`, error)
    }
  }

  /**
   * Close all open MIDI inputs
   */
  async closeAllInputs(): Promise<void> {
    const deviceIds = Array.from(this.inputDevices.keys())
    await Promise.all(deviceIds.map(id => this.closeInput(id)))
  }

  /**
   * Register callback for sysex messages
   */
  onSysex(callback: SysexCallback): () => void {
    this.sysexCallbacks.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.sysexCallbacks.delete(callback)
    }
  }

  /**
   * Register callback for device changes
   */
  onDeviceChange(callback: DeviceChangeCallback): () => void {
    this.deviceChangeCallbacks.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.deviceChangeCallbacks.delete(callback)
    }
  }

  /**
   * Check if sysex is enabled in the browser
   */
  static isSysexSupported(): boolean {
    // Sysex support requires HTTPS in production
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      return false
    }
    return true
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    await this.closeAllInputs()
    
    if (this.midiAccess) {
      this.midiAccess.removeEventListener('statechange', this.handleStateChange)
      this.midiAccess = null
    }
    
    this.sysexCallbacks.clear()
    this.deviceChangeCallbacks.clear()
    this.isInitialized = false
    
    console.log('MIDI service shut down')
  }

  // Private methods

  private scanDevices(): void {
    const devices = this.getInputDevices()
    this.notifyDeviceChange(devices)
  }

  private handleStateChange = (event: MIDIConnectionEvent): void => {
    if (event.port) {
      console.log('MIDI device state changed:', event.port.name, event.port.state)
    }
    this.scanDevices()
  }

  private handleMidiMessage = (event: MIDIMessageEvent): void => {
    const data = event.data
    
    if (!data) {
      return
    }
    
    // Check if this is a sysex message (starts with 0xF0 and ends with 0xF7)
    if (data[0] === 0xF0 && data[data.length - 1] === 0xF7) {
      const message: SysexMessage = {
        data: data,
        timestamp: event.timestamp,
      }
      
      // Notify all sysex callbacks
      this.sysexCallbacks.forEach(callback => callback(message))
    }
  }

  private notifyDeviceChange(devices: MIDIDevice[]): void {
    this.deviceChangeCallbacks.forEach(callback => callback(devices))
  }
}

// Singleton instance
export const midiService = new MIDIService()
