# Changelog

All notable changes to the Unified Guitar Scale Visualizer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2025-06-14

### Added
- Automatic version string updates in template based on package.json version
- Centralized path configuration system in package.json for all build tools
- Shared configuration utility (`tools/config.js`) for consistent path management

### Changed
- Changed the SVG "save" button to be text above and to the right of the visualization, in the same text format as the "save pattern" and "export pattern" buttons
- Template now uses placeholders (`{{VERSION}}` and `{{DATE}}`) that are automatically replaced during deployment
- All build tools now use centralized paths from package.json instead of hardcoded relative paths

### Improved
- Deploy script automatically updates version string and date on each deployment
- Build tools are now more maintainable with single source of truth for file paths
- Reduced code duplication across tools with shared configuration utilities

## [1.0.0] - 2025-06-14

### Added
- Lint script for code quality enforcement
- "Update current preset" button with save (floppy disk) emoji for custom presets
- "Delete current preset" button with trash emoji
- White border around black notes in visualization for better contrast
- Title and subtitle rendering directly within SVG visualization
- Scale degree repetition to show pattern continuation
- Comprehensive test coverage for core modules

### Changed
- "Save as preset" button converted to plus-emoji button with "Save as new preset" tooltip
- Scale input label changed from "Scale" to "Select a scale" for clarity
- Preview title updated to "Unified Guitar Scale Visualizer"
- Exported SVG filenames now reflect title and subtitle in compact format
- Scale degree display updates dynamically when selecting different degrees
- Moved FRET_PADDING_BELOW/ABOVE constants from fretboardAlgorithm to widget
- Moved OCTAVE_2_NOTES constant into widget for better organization
- Consolidated duplicate lcm/gcd implementations into musicalTheory module

### Removed
- Print function and related CSS styles from both blog post and template
- Duplicate method implementations across split code files

### Fixed
- Code organization by eliminating duplicate implementations
- Improved visual hierarchy with better button positioning
- Enhanced user experience with clearer labeling and feedback

## [0.1.0] - 2025-01-11

### Added
- Initial release of Guitar Scale Visualizer
- Core musical theory algorithms for scale generation
- Fretboard algorithm for optimal note positioning
- Interactive widget with preset management
- Support for multiple tunings (guitar, bass, perfect fourths)
- SVG-based visualization with export functionality
- Pattern import/export capabilities
- Responsive design with Tailwind CSS
- Comprehensive test suite with Jest
- Automated build and deployment pipeline