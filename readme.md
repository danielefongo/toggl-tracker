# toggl-compile

**toggl-compile** is a simple nodejs tool to automatically generate time entries on Toggl. It can be used in 2 different ways:
- **Append mode**, by recording from the last recorded activity.
- **Picky mode**, by compiling not-filled selected past (and future) holes.

By default only working hours are included in time entry generation:
- From monday to friday
- From 9:00 to 13:00 (Local Time)
- From 14:00 to 18:00 (Local Time)

Working days and Working hours can be configured by changing the `config.json` file.

## Getting started

### Setup
To use toggl-compile you have to set up environment variables:
```
TOGGL_TOKEN=<token>
TOGGL_WORKSPACE=<workspace_id>
GOOGLE_TOKEN=<token> #optional
GOOGLE_LOCALE=<locale> #optional
```

You can put these variables in a `.env` file in the project root or export them before running the tool.
The `GOOGLE_TOKEN` and `GOOGLE_LOCALE` variables are used to retrieve national holidays from google calendar api and they are optional. If not set, holidays wont be skipped.

#### Obtain toggl token

* Go to toggl profile [page](https://toggl.com/app/profile) and scroll down until the end

#### Obtain toggl workspace

* Go to projects [page](https://toggl.com/app/projects/)
* Select the workspace
* The url contains the workspace id: `https://toggl.com/app/projects/<WORKSPACE_ID>/list`

#### Obtain google token

* Create API app in google developer account [page](https://console.developers.google.com)
* Create an API Key from the `Credentials` tab

#### Set google locale

* Go in this [page](https://gist.github.com/danielefongo/0bce52012cde8f714cfb7ec1e677c7bd) and search for the locale you want to use

### Run

#### Append mode
To run the tool in append mode just execute the following command:
```
npm run append
```

#### Picky mode
To run the tool in random mode just execute the following command:
```
npm run picky
```