# Pocket Scion Data Plotter - Swift Implementation

A native Swift + SwiftUI application for real-time plotting and visualization of [Pocket Scion](https://pocketscion.com/) sensor data with direct MIDI sysex communication.

## Status

🚧 **Planned** 

## Features

- **Native Apple Experience**: SwiftUI with modern, responsive interface
- **Multi-Platform**: macOS and iOS from single codebase via Mac Catalyst
- **Direct Hardware Access**: Core MIDI for direct Pocket Scion communication
- **No Controller App**: Reads MIDI sysex directly, eliminating dependency
- **Real-time Plotting**: SwiftUI Charts or custom Metal rendering
- **Data Export**: JSON, CSV export with sharing capabilities

## Requirements

- **Development**: Xcode 15+
- **Deployment**: macOS 11+ (Big Sur) / iOS 14+
- **Language**: Swift 5.9+
- **Frameworks**: SwiftUI, Core MIDI, Combine

## Installation

### Development Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/HaraldWalker/PocketScionDataPlotter.git
   cd PocketScionDataPlotter/swift
   ```

2. Open Xcode project:
   ```bash
   open PocketScion/PocketScion.xcodeproj
   ```

3. Build and run:
   - Select target (My Mac for macOS, or iOS Simulator for iOS)
   - Press ⌘R to build and run

### Building for Distribution

See [SWIFT_UI_MIGRATION.md](../SWIFT_UI_MIGRATION.md) for detailed build instructions.

## Usage

### Prerequisites

1. **Pocket Scion Hardware**: Ensure you have the Pocket Scion hardware device connected to your Mac or iOS device via USB or Lightning/USB-C adapter.

2. **No Controller App Required**: This implementation reads MIDI sysex directly from the hardware.

## Technical Details

### Architecture

- **UI Framework**: SwiftUI with declarative interface
- **Data Flow**: Combine framework for reactive programming
- **MIDI Communication**: Core MIDI framework
- **Plotting**: SwiftUI Charts (iOS 16+) or custom Metal rendering

### Project Structure

```
swift/
├── PocketScion/
│   ├── App/                      # App entry point
│   ├── Models/                   # Data models
│   ├── ViewModels/               # View models
│   ├── Services/                 # MIDI, parsing, etc.
│   ├── Views/                    # SwiftUI views
│   └── Utilities/               # Helper extensions
└── README.md                     # This file
```

## Development

### Code Style

- Follow Swift API Design Guidelines
- Use SwiftUI best practices
- Maintain Combine reactive patterns
- Use meaningful type names

### Testing

- Unit tests for data processing
- UI tests for critical flows
- Hardware testing with Pocket Scion device

## Deployment

### Mac App Store

- Requires Apple Developer account ($99/year)
- Mac Catalyst for iOS app on Mac
- App Store Review process

### iOS App Store

- Requires Apple Developer account ($99/year)
- TestFlight for beta testing
- App Store Review process

### Direct Distribution

- macOS: Signed and notarized DMG
- iOS: Ad-hoc distribution (limited devices)

## Troubleshooting

### Common Issues

1. **Device Not Detected**
   - Ensure Pocket Scion is connected via USB
   - Check Raw Output Mode is enabled
   - Try different USB port or cable
   - Restart the application

2. **Permission Denied**
   - macOS: No special permissions needed for MIDI
   - iOS: Ensure proper entitlements in Xcode

3. **Plot Not Updating**
   - Verify device connection status
   - Check data stream selection
   - Ensure device is transmitting data

## Limitations

- **Apple Only**: Runs only on Apple platforms (macOS, iOS)
- **Development Effort**: Requires complete rewrite
- **Learning Curve**: Swift and SwiftUI knowledge required

## Future Improvements

- Add iCloud sync for data
- Support for multiple Pocket Scion devices

## Resources

- [Apple Developer - Core MIDI](https://developer.apple.com/documentation/coremidi)
- [Apple Developer - SwiftUI](https://developer.apple.com/documentation/swiftui)
- [Mac Catalyst Documentation](https://developer.apple.com/documentation/ipados-and-macos)
- [SwiftUI Charts Documentation](https://developer.apple.com/documentation/charts)

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
