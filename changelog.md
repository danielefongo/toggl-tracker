# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.8.1] - 2021-10-29

### Fixed

- Vulnerabilities in some packages

## [0.8.0] - 2021-06-24

### Changed

- Rest service url from www.toggl.com to api.track.toggl.com

## [0.7.7] - 2021-01-22

### Fixed

- Vulnerabilities in some packages

## [0.7.6] - 2020-09-10

### Fixed

- Vulnerabilities in some packages

## [0.7.5] - 2020-05-04

### Fixed

- Retrieve future entries properly

## [0.7.4] - 2020-04-27

### Fixed

- Method list on Asker
- Method checkbox on Asker

## [0.7.3] - 2020-04-24

### Added

- Method raw on Asker
- Method input on Asker
- Method list on Asker
- Method checkbox on Asker

### Changed

- Method autocompleteInquire on Asker is renamed to autocomplete

### Removed

- Method inquire on Asker

## [0.7.2] - 2020-04-23

### Changed

- Method chooseClient on Asker
- Make method autocompleteInquire on Asker more flexible.

## [0.7.1] - 2020-04-23

### Added

- Uninstall command: uninstall an action.
- Update command: update all actions.
- Detect not installed actions when uninstalling them.
- Detect ambiguous actions when uninstalling them.
- Detect and revert malformed actions when updating them.

## [0.7.0] - 2020-04-20

### Added

- Action system.
- Install command: install an action from github using "user/repo" pattern.
- Run command: run an installed action.
- List command: show all installed actions.
- Smart action finder: run an installed action using "repo" instead of "user/repo" if unique.
- Detect not installed actions when running them.
- Detect ambiguous installed actions when running them.
- Detect malformed actions when installing them.
- Detect malformed actions when running them.

### Removed

- Plugin system.
- Plugin mode.
- Picky mode.
- Append mode.
- Summary mode.
- Check mode.

## [0.6.3] - 2020-04-18

### Added

- Method rawReportsPost on Toggl.

## [0.6.2] - 2020-04-17

### Changed

- Extend method rawReportsGet of Toggl with response type.

## [0.6.0] - 2020-04-06

### Added

- Plugin system.
- Plugin mode: a command to run custom javascrip files.
- Expose Loader module. Useful to load constructors for domain objects and useful modules.
- Expose Asker module. Useful to do interactive question to user.
- Expose TimeSlotter module. Useful to calculate working timeslots using working days, working hours intervals and google days api.
- Expose Asker module. Useful to do interactive question to user.
- Expose Config module. It represents the actual configuration.

## [0.5.6] - 2020-03-17

### Changed

- Let look forward days to be 0.
- Setting look forward days to 0 will consider today (until 23:59) in selected window.

## [0.5.5] - 2020-03-17

### Added

- Use command line configuration-args. They overrides stored configuration.
- Add help command to show commands and all possible configuration-args.

### Changed

- Show invalid configuration options if validation fails instead of forcing setup.

## [0.5.4] - 2020-03-15

### Changed

- Improve validation by denying invalid working hours intervals. Intervals like 9-0 or 9-25 are not valid.

## [0.5.3] - 2020-03-14

### Fixed

- Validate missing fields on configuration.

## [0.5.2] - 2020-03-14

### Added

- Validate configuration on load.
- Validate configuration during config command.
- Force configuration command if validation fails.
- Add validation for working days. They should be in camel case and valid.
- Add validation for working hours intervals. They should be valid integer ranges (eg. 1-10).
- Add validation for look behind days. They should be positive (1+).
- Add validation for look forward days. They should be positive (1+).
- Add validation for toggl token. It should be not blank.
- Add validation for toggl workspace. It should be not blank.

## [0.5.1] - 2020-03-13

### Changed

- Use granularity on check mode.

## [0.5.0] - 2020-03-13

### Added

- Summary mode: a command show a summary of tracked hours for all projects in the workspace. It can be use with different granularity (day, week..).

## [0.4.5] - 2020-03-10

### Fixed

- Load default config properly if configuration file is not found.

## [0.4.4] - 2020-03-06

### Added

- Squash consecutive entries when running picky or append. Useful when working hours intervals are fine-grained.

### Changed

- Convert project to typescript.

## [0.4.3] - 2020-02-28

### Fixed

- Fix working hours intervals parsing.

## [0.4.2] - 2020-02-28

### Fixed

- Update homepage on package json.

## [0.4.1] - 2020-02-27

### Changed

- Use different fuzzy search library.

## [0.4.0] - 2020-02-27

### Added

- Handle intervals with minutes.

## [0.3.0] - 2020-02-26

### Added

- Handle time entries without project.

## [0.2.1] - 2020-02-26

### Fixed

- Show archivied projects on check mode.

## [0.2.0] - 2020-02-25

### Added

- Check mode: a command to show last inserted entries. Uses look behind days and look forward days to check for holes.

## [0.1.11] - 2020-02-25

### Added

- Picky mode: a command to track entries for not-filled selected past (and future) holes. Uses look behind days and look forward days to check for holes.
- Append mode: a command to track entries from the last recorded entry.
- Configuration mode: a command to update user information like toggl token.
- Automatically run configuration before any other command if configuration file is not found.
- Use working days (config) for picky and append mode.
- Use working hours intervals (config) for picky and append mode. They can have a custom granularity.
- Use optional google api and locale (config) to skip holidays in picky and append mode.
- Search for projects using fuzzy search.
- Show helper if a not valid command is inserted.

[unreleased]: https://github.com/danielefongo/toggl-tracker/compare/0.8.1...HEAD
[0.8.1]: https://github.com/danielefongo/toggl-tracker/compare/0.8.0...0.8.1
[0.8.0]: https://github.com/danielefongo/toggl-tracker/compare/0.7.7...0.8.0
[0.7.7]: https://github.com/danielefongo/toggl-tracker/compare/0.7.6...0.7.7
[0.7.6]: https://github.com/danielefongo/toggl-tracker/compare/0.7.5...0.7.6
[0.7.5]: https://github.com/danielefongo/toggl-tracker/compare/0.7.4...0.7.5
[0.7.4]: https://github.com/danielefongo/toggl-tracker/compare/0.7.3...0.7.4
[0.7.3]: https://github.com/danielefongo/toggl-tracker/compare/0.7.2...0.7.3
[0.7.2]: https://github.com/danielefongo/toggl-tracker/compare/0.7.1...0.7.2
[0.7.1]: https://github.com/danielefongo/toggl-tracker/compare/0.7.0...0.7.1
[0.7.0]: https://github.com/danielefongo/toggl-tracker/compare/0.6.3...0.7.0
[0.6.3]: https://github.com/danielefongo/toggl-tracker/compare/0.6.2...0.6.3
[0.6.2]: https://github.com/danielefongo/toggl-tracker/compare/0.6.0...0.6.2
[0.6.0]: https://github.com/danielefongo/toggl-tracker/compare/0.5.6...0.6.0
[0.5.6]: https://github.com/danielefongo/toggl-tracker/compare/0.5.5...0.5.6
[0.5.5]: https://github.com/danielefongo/toggl-tracker/compare/0.5.4...0.5.5
[0.5.4]: https://github.com/danielefongo/toggl-tracker/compare/0.5.3...0.5.4
[0.5.3]: https://github.com/danielefongo/toggl-tracker/compare/0.5.2...0.5.3
[0.5.2]: https://github.com/danielefongo/toggl-tracker/compare/0.5.1...0.5.2
[0.5.1]: https://github.com/danielefongo/toggl-tracker/compare/0.5.0...0.5.1
[0.5.0]: https://github.com/danielefongo/toggl-tracker/compare/0.4.5...0.5.0
[0.4.5]: https://github.com/danielefongo/toggl-tracker/compare/0.4.4...0.4.5
[0.4.4]: https://github.com/danielefongo/toggl-tracker/compare/0.4.3...0.4.4
[0.4.3]: https://github.com/danielefongo/toggl-tracker/compare/0.4.2...0.4.3
[0.4.2]: https://github.com/danielefongo/toggl-tracker/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/danielefongo/toggl-tracker/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/danielefongo/toggl-tracker/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/danielefongo/toggl-tracker/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/danielefongo/toggl-tracker/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/danielefongo/toggl-tracker/compare/0.1.11...0.2.0
[0.1.11]: https://github.com/danielefongo/toggl-tracker/releases/tag/0.1.11
