# Contributing to Pocket Scion Data Plotter

Thank you for your interest in contributing to the Pocket Scion Data Plotter project! This document provides guidelines for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PocketScionDataPlotter.git
   cd PocketScionDataPlotter
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application to test:
   ```bash
   python pocket_scion_data_plotter.py
   ```

## Code Style Guidelines

### Python Style
- Follow PEP 8 guidelines
- Use 4 spaces for indentation (no tabs)
- Maximum line length: 79 characters
- Use descriptive variable and function names

### Documentation
- Add docstrings to all functions and classes
- Use triple quotes for docstrings
- Include parameter descriptions and return values

### Comments
- Comment complex logic
- Explain non-obvious calculations
- Use inline comments sparingly

## Project Structure

```
PocketScionDataPlotter/
|-- pocket_scion_data_plotter.py  # Main application file
|-- README.md                      # Project documentation
|-- requirements.txt               # Python dependencies
|-- LICENSE                        # MIT License
|-- CONTRIBUTING.md               # This file
|-- .gitignore                     # Git ignore file
```

## Types of Contributions

### Bug Reports
- Use the GitHub issue tracker
- Include detailed reproduction steps
- Provide system information (OS, Python version)
- Include error messages and logs

### Feature Requests
- Open an issue to discuss the feature first
- Provide clear use cases
- Consider implementation complexity

### Code Contributions
- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- Test coverage

## Submitting Changes

1. **Branch Naming**: Use descriptive branch names
   - `bugfix/description-of-bug`
   - `feature/description-of-feature`
   - `docs/update-documentation`

2. **Commit Messages**: Use clear, descriptive commit messages
   - Start with a capital letter
   - Use present tense ("Add" not "Added")
   - Keep first line under 50 characters
   - Include detailed description if needed

3. **Pull Requests**:
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Reference related issues
   - Ensure all tests pass

## Testing

### Manual Testing
- Test the GUI on different screen resolutions
- Verify OSC data reception
- Test all button functionality
- Check plot rendering and updates

### Platform Testing
- Test on macOS (primary target)
- Test on Windows if possible
- Test on Linux if possible

## Code Review Process

1. All submissions require review
2. Maintain code quality standards
3. Ensure documentation is updated
4. Verify no breaking changes

## Release Process

1. Update version number in code
2. Update CHANGELOG.md
3. Create Git tag
4. Create GitHub release

## Community Guidelines

- Be respectful and constructive
- Welcome new contributors
- Focus on what is best for the project
- Show empathy towards other community members

## Questions?

- Open an issue for questions
- Check existing issues for answers
- Contact maintainers directly if needed

Thank you for contributing to Pocket Scion Data Plotter!
