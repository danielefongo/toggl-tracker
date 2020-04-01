# toggl-tracker

![Continuous Integration](https://github.com/danielefongo/toggl-tracker/workflows/Continuous%20Integration/badge.svg)

**toggl-tracker** is a simple Node.js tool to automatically generate time entries on Toggl. It can be used in different ways:
- **append** mode: compiles from the last recorded activity.
- **picky** mode: compiles not-filled selected past (and future) holes.
- **check** mode: show last inserted entries.
- **summary**: show a summary of tracked hours for all projects in the workspace.
- **plugin**: run a custom plugin.

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

#### Cutting edge
If you want the master version of the tool, you can run these commands:
```
git clone https://github.com/danielefongo/toggl-tracker
cd toggl-tracker
npm run local-install
```

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

You can alternatively pass command-line options to override loaded configuration:
```
toggl-tracker command <configuration-args>
```

You can find all possible commands and configuration-args by running:
```
toggl-tracker -h
```

### Plugins

You can build your own plugin by creating a js file on `$HOME/.toggl-tracker` folder (you have to manually create it).
The script should be like this:

```javascript
module.exports = async function (loader, toggl, timeSlotter, asker, config) {
  //logic
}
```

Then you can use the plugin by running:
```
toggl-tracker plugin <PLUGIN>
```

where `PLUGIN` is the name of the file without the extension.

If you need to use domain stuff like moment or Interval, you can use `loader` to retrieve the class or the module.
Useful domain objects are:
* Config: `const { Config } = loader.load("config")`
* Interval: `const { Interval } = loader.load("interval")`
* moment: `const moment = loader.load("moment")`
* Time: `const { Time } = loader.load("time")`
* TimeSlot: `const { TimeSlot } = loader.load("timeSlot")`

## Authors

* **[Daniele Fongo](https://github.com/danielefongo)**

## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details
