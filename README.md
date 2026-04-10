# Pocket Scion Data Plotter

Multi-platform applications for real-time plotting and visualization of [Pocket Scion](https://pocketscion.com/) sensor data.

This repository contains three implementations targeting different platforms:

- **Python** - Desktop application (Windows, macOS, Linux) via OSC
- **Swift** - Native macOS + iOS application with direct MIDI access
- **Web** - Browser-based application with Web MIDI API

![screenshot.png](screenshot.png)

## Implementations

### Python Implementation ✅
- **Location**: `python/`
- **Status**: Complete and functional
- **Target**: Windows, macOS, Linux
- **Communication**: OSC (Open Sound Control) via UDP
- **Dependency**: Requires Pocket Scion Controller app
- **See**: [python/README.md](python/README.md)

### Swift Implementation 🚧
- **Location**: `swift/`
- **Status**: Planned
- **Target**: macOS + iOS (Mac Catalyst)
- **Communication**: Direct MIDI sysex via Core MIDI
- **Dependency**: No controller app required
- **See**: [swift/README.md](swift/README.md)

### Web Implementation ✅
- **Location**: `web/`
- **Status**: Done
- **Target**: Any modern browser with Web MIDI API
- **Communication**: Direct MIDI sysex via Web MIDI API
- **Dependency**: No controller app required
- **See**: [web/README.md](web/README.md)


## Features

All implementations share:

- **Real-time Data Plotting**: Live visualization of Pocket Scion sensor data
- **Data Export**: raw data export capabilities

## Repository Structure

```
PocketScionDataPlotter/
├── python/              # Python/Tkinter implementation
├── swift/               # Swift + SwiftUI implementation
├── web/                 # Web implementation
├── README.md            # This file
```
## Choosing an Implementation

- **Python**: Use if you need quick development, cross-platform desktop, or already have the controller app
- **Swift**: Use if you want native Apple experience, App Store distribution, or iOS support
- **Web**: Use if you want maximum portability, no installation, or easy sharing

## Development

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **Python**: Follow PEP 8 guidelines
- **Swift**: Follow Swift API Design Guidelines
- **Web**: Follow React and TypeScript best practices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Pocket Scion project for the sensor hardware
- [pocket-scion-osc](https://github.com/ucodia/pocket-scion-osc) for sysex parsing reference
- Python-OSC, Matplotlib, Tkinter (Python implementation)
- Apple, Core MIDI, SwiftUI (Swift implementation)
- Web MIDI API, React, Vite (Web implementation)

---

**Note**: This project is designed specifically for Pocket Scion sensor data visualization. It assumes familiarity with the Pocket Scion hardware and MIDI/OSC data protocols.
