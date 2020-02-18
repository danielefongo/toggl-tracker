# toggl-tracker

**toggl-tracker** is a simple nodejs tool to automatically generate time entries on Toggl. It can be used in 2 different ways:
- **append** mode, by recording from the last recorded activity.
- **picky** mode, by compiling not-filled selected past (and future) holes.

## Getting started

### Setup
To use toggl-tracker just install it from npm and run it:
```
npm install -g toggl-tracker
toggl-tracker <mode>
```

If you run the tool for the first time, it will ask you some useful informations like working days, working hours intervals and so on (they will be stored in user home). It will also ask you to provide:
* **toggl token**
* **toggl workspace** 
* **google token** (optional) 
* **google locale** (optional)

Google token and google locale are used to retrieve national holidays from google calendar api and are optionals. If not set, holidays wont be skipped.

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
toggl-tracker append
```

#### Picky mode
To run the tool in random mode just execute the following command:
```
toggl-tracker picky
```

#### Config
To change configuration just execute the following command:
```
toggl-tracker config
```