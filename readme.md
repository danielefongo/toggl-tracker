# toggl-tracker

![Continuous Integration](https://github.com/danielefongo/toggl-tracker/workflows/Continuous%20Integration/badge.svg)

**toggl-tracker** is a simple Node.js tool to automatically generate time entries on Toggl. It can be used in different ways:
- **append** mode: compiles from the last recorded activity.
- **picky** mode: compiles not-filled selected past (and future) holes.
- **check** mode: show last inserted entries.
- **summary**: show a summary of tracked hours for all projects in the workspace.

## Getting started

### Setup
To use toggl-tracker just install it from npm and run it:
```
npm install -g toggl-tracker
toggl-tracker <mode>
```

If you run the tool for the first time, it will ask you some useful informations like working days, working hours intervals and so on (they will be stored in user home). It will also ask you to provide:
* **Toggl token**
* **Toggl workspace** 
* **Google token** (optional) 
* **Google locale** (optional)

"Google token" and "Google locale" are used to retrieve national holidays from Google Calendar API and are optionals. If not set, holidays wont be skipped.

#### Obtain toggl token

* Go to toggl profile [page](https://toggl.com/app/profile) and scroll down until the end

#### Obtain toggl workspace

* Go to projects [page](https://toggl.com/app/projects/)
* Select the workspace
* The url contains the workspace id: `https://toggl.com/app/projects/<WORKSPACE_ID>/list`

#### Obtain Google token

* Create API app in Google Developer account [page](https://console.developers.google.com)
* Create an API Key from the `Credentials` tab

#### Set Google locale

* Go in this [page](https://gist.github.com/danielefongo/0bce52012cde8f714cfb7ec1e677c7bd) and search for the locale you want to use

### Configuration

To change configuration just execute the following command:
```
toggl-tracker config
```

## Authors

* **[Daniele Fongo](https://github.com/danielefongo)**

## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details
