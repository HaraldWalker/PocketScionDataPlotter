# Changelog

All notable changes to Pocket Scion Data Plotter will be documented in this file.

## [1.0.0] - 2026-04-09

### Added
- Initial release of Pocket Scion Data Plotter
- Real-time OSC data reception and plotting
- Dark theme interface with custom styling
- Data selection options (Mean, Deviation)
- Plot export functionality (PNG images)
- Data export to CSV format
- Auto-scaling toggle for plot axes
- 30-second time window display
- Compact horizontal control panel layout
- Custom ClickableLabel components to avoid macOS button focus issues
- Status bar with signal monitoring
- Comprehensive error handling

### Features
- **GUI Framework**: Tkinter with dark theme implementation
- **Plotting**: Matplotlib real-time data visualization
- **Communication**: Python-OSC library for UDP message handling
- **Threading**: Separate OSC receiver thread
- **Data Processing**: 555 timer calculations for resistance conversion
- **Buffer Management**: Efficient deque-based data storage

### Technical Details
- OSC IP: 127.0.0.1 (localhost)
- OSC Port: 11045
- Data buffer: 1000 samples maximum
- Signal timeout: 3.0 seconds
- Window size: 1200x900 pixels
- Color scheme: Material Design inspired dark theme

### Known Issues
- None currently reported

### Platform Support
- macOS: Primary target, fully tested
- Windows: Should work, not extensively tested
- Linux: Should work, not extensively tested
