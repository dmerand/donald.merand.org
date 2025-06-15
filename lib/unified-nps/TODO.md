# Prompt

- Make a TODO list for yourself with the un-checked items from the "TODO LIST" section of this document below.
- Once you have made the list, please begin to execute any un-checked items.
- For each item, think hard unless otherwise noted.
- For all changes, please:
    - Add tests + verify that they run
    - Run linting
- After all changes have been made, review any files that have been changed against the main branch for duplicated methods, orphaned methods, and other artifacts of development. If any exist, please present a plan to the user for resolution.
- Update the package version semantically.
- Update the CHANGELOG.md with a summary of the changes
- Run the deploy script + check its verifications
- After all of the above has completed, you may mark checks next to the resolved TODO list items below and add a date next to the checkbox.

Important: Project context and architecture details can be found in @.claude/README.md

# TODO LIST

- [x] Adjust the visualization to have consistent padding and margins regardless of the length of the title or the number of notes in the diagram - **COMPLETED 2025-06-15**
- [x] Change the SVG "save" button to be text above and to the right of the visualization, in the same text format as the "save pattern" and "export pattern" buttons. - **COMPLETED 2025-06-14**
- [x] Update the visualization to put a white border around the black notes. - **COMPLETED 2025-06-14**
- [x] Move the Title + Subtitle out of HTML + into the SVG visualization - **COMPLETED 2025-06-14** 
- [x] Label for "Scale" input should be "Select a scale" - **COMPLETED 2025-06-14**
- [x] Have the exported SVG name reflect the title + subtitle in a compact manner - **COMPLETED 2025-06-14**
- [x] "Starting from scale degree" should update when selecting a scale degree - **COMPLETED 2025-06-14**
- [x] Have the selected scale degree repeat 1 extra time when calculating the pattern. This way the user can see how the pattern repeats. - **COMPLETED 2025-06-14**
- [x] Change the preview title to "Unified Guitar Scale Visualizer" - **COMPLETED 2025-06-14**
- [x] Get rid of the "Print" function and any related CSS styles related to it, in both the blog post and the template. - **COMPLETED 2025-06-14**
- [x] Move FRET_PADDING_BELOW / ABOVE into widget from fretboardAlgorithm - **COMPLETED 2025-01-14**
- [x] move OCTAVE_2_NOTES into widget - **COMPLETED 2025-01-14**
- [x] consolidate lcm / gcd into musicalTheory. There is a duplicate implementation in widget - **COMPLETED 2025-01-14**
- [x] generally: search for duplicate implementations of methods since we split the code into multiple files. - **COMPLETED 2025-01-14**
- [x] Make "Save as preset" into a plus-emoji button with "Save as new preset" as the tooltip. - **COMPLETED 2025-01-14**
- [x] Add an "update current preset" button with a "save" (floppy disk) emoji, which appears for custom presets - **COMPLETED 2025-01-14**
- [x] Add a "delete current preset" button with a "trash" emoji - **COMPLETED 2025-01-14**
- [x] Add a lint script - **COMPLETED 2025-01-14**
