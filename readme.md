# toggl-tracker

![Continuous Integration](https://github.com/danielefongo/toggl-tracker/workflows/Continuous%20Integration/badge.svg)

**toggl-tracker** is a simple Node.js tool to automatically run actions on Toggl. Available commands are:
- **config**: change the configuration.
- **install**: install action from github using `user/repository` format.
- **uninstall**: uninstall action. You can use just the repo name if unique.
- **update**: update actions.
- **list**: show installed actions.
- **run**, run installed action. You can use just the repo name if unique.

You can find the changelog [here](https://github.com/danielefongo/toggl-tracker/blob/master/changelog.md).

## Getting started

### Setup
To use toggl-tracker just install it from npm and run it:
```
npm install -g toggl-tracker
toggl-tracker install danielefongo/picky # optional
toggl-tracker install danielefongo/append # optional
toggl-tracker install danielefongo/check # optional
toggl-tracker install danielefongo/summary # optional
toggl-tracker run <action>
```

If you run the tool for the first time, it will ask you some useful information like working days, working hours intervals and so on (they will be stored in user home). It will also ask you to provide:
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
toggl-tracker run action <configuration-args>
```

You can find all possible configuration-args by running:
```
toggl-tracker -h
```

## Actions

You can build your own action by creating a github repository with a main file named `action.js`.
The script should be like this:

```javascript
module.exports = function(loader, toggl, timeSlotter, asker, config) {
  this.run = async () => {
    //logic
  }

  this.help = () => {
    return "description..." // showed on toggl-tracker list
  }
}
```

Then you can use the plugin by running:
```
toggl-tracker run <ACTION>
```

where `ACTION` is the name of the repo (if unique) or the combination of username and repo, like `danielefongo/picky`.

If you need to use domain stuff like moment or Interval, you can use `loader` to retrieve the class or the module.
Useful domain objects are described below.

**Config**
```
const { Config } = loader.load("config")
```

**moment**

It is the momentjs module.
```
const moment = loader.load("moment")
const now = moment()
```

**Time**
```
const { Time } = loader.load("time")
const time = new Time(hours, minutes)
```

**Interval**
```
const { Interval } = loader.load("interval")
const interval = new Interval(time1, time2)
```

**TimeSlot**
```
const { TimeSlot } = loader.load("timeSlot")
const timeSlot = new TimeSlot(moment1, moment2)
```

**Client, Entry, Project, Task**

You should don't create these. You can retrieve them using toggl dependency.

### Toggl

Toggl is using [toggl-api v8](https://github.com/toggl/toggl_api_docs/blob/master/toggl_api.md) and [reports-api v2](https://github.com/toggl/toggl_api_docs/blob/master/reports.md).

Methods (all async):
* `rawTogglPost(url, object)`: raw post on toggl api. You can skip _"https://www.toggl.com/api/v8"_ on the url.
* `rawTogglGet(url, queryObject)`: raw get on toggl api. You can skip _"https://www.toggl.com/api/v8"_ on the url. Query object will be converted to query string.
* `rawReportsPost(url, object, responseType)`: raw get on reports api. You can skip _"https://toggl.com/reports/api/v2"_ on the url. Response type is 'json' by default. If you want to download an object like pdf, you can pass 'arraybuffer' instead.
* `rawReportsGet(url, queryObject, responseType)`: raw get on reports api. You can skip _"https://toggl.com/reports/api/v2"_ on the url. Query object will be converted to query string. Response type is 'json' by default. If you want to download an object like pdf, you can pass 'arraybuffer' instead.
* `createTimeEntries(project, task, description, timeSlots)`: create a time entry for each timeslot. You should use project, task and timeslot domain objects.
* `createTimeEntry(project, task, description, timeSlot)`: create a time entry for single timeslot. You should use project, task and timeslot domain objects.
* `getTimeEntries(from, to)`: obtain time entries in range. You should pass moments.
* `getLastTimeEntry(from, to)`: obtain last time entry in range. You should pass moments.
* `getTimeEntriesHoles(from, to)`: obtain time entry holes (as timeslots) in range. You should pass moments.
* `getActiveProjects()`: obtain active projects.
* `getAllProjects()`: obtain all projects.
* `getClients()`: obtain clients.
* `getProject(id)`: obtain project by id.
* `getTasks(id)`: obtain tasks for specific project.
* `getTask(id)`: obtain task by id.
* `getSummary(from, to)`: obtain summary in range. You should pass moments.

### TimeSlotter

TimeSlotter creates or squash working timeslots using provided intervals (by configuration). Timeslots are generated excluding festive days (if google api is set).

Methods (all async):
* `slotsIn(timeslot)`: generate working slots in a generic slot.
* `slotsInMany(timeslots)`: generate working slots in list of generic slots.
* `squash(timeslots)`: merge overlapping slots.

### Asker

Asker expose utility functions to ask user for informations. It is a wrapper of inquirerjs module.

Methods (all async):
* `raw(prompts)`: wrapper for `prompt` method of inquirerjs module.
* `input(question, default?)`: function to insert a text. Default is optional.
* `list(question, choices, default?)`: function to choose an element from a list. Default is optional.
* `checkbox(question, choices, default?)`: function to choose one or more elements from a list. Default is optional.
* `autocompleteInquire(question, choices)`: wrapper for `prompt` method of inquirerjs module with autocomplete. Complex choices must have `description` property.
* `chooseProject(projects, clients)`: function to choose a project. You should use project and client domain objects.
* `chooseClient(clients)`: function to choose a client. You should use client domain object.
* `chooseTask(tasks)`: function to choose a task. You should use task domain object.
* `pickSlots(slots)`: function to pick one or many slots. You should use TimeSlot domain object.

## Authors

* **[Daniele Fongo](https://github.com/danielefongo)**

## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details
