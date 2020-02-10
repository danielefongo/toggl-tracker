# toggl-compile

**toggl-compile** is a simple nodejs tool to automatically generate time entries on Toggl from the last recorded activity.

By default only working hours are included in time entry generation:
- From monday to friday
- From 8:00 to 12:00 (Zulu Time)
- From 13:00 to 17:00 (Zulu Time)

Working hours can be configured by changing the `config.json` file while working days are still hardcoded.

## Getting started

### Setup
To use toggl-compile you have to set up environment variables:
```
TOGGL_TOKEN=<token>
TOGGL_WORKSPACE=<workspace_id>
```

You can put these variables in a `.env` file in the project root or export them before running the tool.

### Run
To run the tool just execute the following command:
```
node index.js
```

## Todos
- Handle temporal holes (greater than 6 days) between last time entry and now.
- Handle national holidays
- Make working days configurable