# Changelog

All notable changes to the Unified Guitar Scale Visualizer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2025-06-16

### Added
- **UI Coordination Extraction**: New `UIController` class for managing all UI coordination logic
  - Centralized event handling with proper cleanup tracking for all form interactions
  - Comprehensive form state management including scale preferences and global settings
  - Custom preset operations (save, update, delete) with user-friendly prompts
  - File import/export functionality with JSON pattern validation
  - Proper event listener management to prevent memory leaks

### Changed
- Widget simplified from 773 to ~500 lines by extracting UI coordination to dedicated `UIController`
- Separation of concerns: widget now focuses purely on rendering and visualization
- UI coordination logic moved to testable, isolated module with dependency injection
- All form interactions now managed through centralized controller with consistent error handling

### Improved
- Better architectural separation between rendering (Widget) and coordination (UIController)
- Enhanced testability with 31 new tests specifically for UI coordination logic
- Reduced bundle size from 61.4KB to 38.0KB through improved code organization
- Memory management improvements with proper event listener cleanup
- More maintainable codebase with clear boundaries between UI and rendering concerns

## [1.3.0] - 2025-06-16

### Added
- **Major Architecture Refactor**: Extracted business logic from widget into dedicated core modules
  - `ScaleVisualizer` class for orchestrating scale generation and visualization data
  - `PresetManager` class for handling all localStorage operations and custom presets
- Comprehensive test coverage (95%+) for new core modules with 118 individual test cases
- Dependency injection pattern for improved testability and maintainability

### Changed
- Widget simplified from 809 to 773 lines by delegating business logic to core modules
- Separated concerns: widget now focuses on UI/input conversion, core modules handle algorithms
- Build pipeline updated to include new core modules in distribution
- Improved error handling and validation throughout the architecture

### Improved
- Better separation of concerns with clear module boundaries
- Enhanced maintainability through focused, single-responsibility classes
- Improved testability with isolated, pure function modules
- More robust preset management with proper validation and error handling

## [1.2.0] - 2025-06-16

### Added
- 4-string bass tuning option (E2, A2, D3, G3) to complement existing 5-string bass tuning

## [1.1.0] - 2025-06-15

### Added
- Adaptive text sizing for SVG titles and subtitles to prevent overflow
- Text width estimation method for dynamic layout calculations
- Comprehensive test coverage for visualization layout and sizing logic

### Fixed
- **Critical**: Fixed visualization consistency issue where patterns rendered at different sizes due to fixed viewBox
- SVG viewBox now updates dynamically to match calculated dimensions, ensuring consistent visual scale
- Custom preset emoji buttons (save/delete) now display correctly by removing conflicting CSS
- Width calculation now considers both fretboard requirements and title text width

### Improved
- SVG dimensions now adapt to content while maintaining consistent vertical spacing
- Title text automatically scales down if too wide for the visualization
- Better responsive layout that works with varying pattern lengths and title sizes

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