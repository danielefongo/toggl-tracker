require('dotenv').config()
const TogglClient = require('toggl-api');
const TimeSlotter = require('./timeSlotter')
const FuzzySearch = require('fuzzy-search')

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

const UTCHoursInterval = require('./utcHoursInterval')
const intervals = [new UTCHoursInterval(8, 12), new UTCHoursInterval(13, 17)]

var toggl = new TogglClient({apiToken: API_TOKEN});
var timeSlotter = new TimeSlotter(intervals)
var args = process.argv.slice(2);

async function getLastTimeEntry(workspace_id) {
  return new Promise((resolve, reject) => {
    toggl.getTimeEntries(function(err, data) {
      if(err) reject()
      resolve(data
        .filter(element => element.wid == workspace_id)
        .pop()
      );
    })
  })
}

async function getProjects(workspace_id) {
  return new Promise((resolve, reject) => {
    toggl.getWorkspaceProjects(workspace_id, {}, function(err, data) {
      if(err) reject()
      resolve(data)
    });
  })
}

async function searchProject(keyword) {
  return getProjects(WORKSPACE).then(function(projs) {
    const searcher = new FuzzySearch(projs, ['name', 'id'], {caseSensitive: false, sort: true});
    return searcher.search(keyword)
  })
}

async function createTimeEntryByCopying(timeEntry, projectIdOrName, description) {
  if(description === undefined && projectIdOrName == undefined) {
    description = timeEntry.description
    projectIdOrName = timeEntry.pid
  }
  projects = await searchProject(projectIdOrName)

  if(projects.length == 0) {
    console.log("No matching for \"" + projectIdOrName + "\"")
    return
  }
  if(projects.length > 1) {
    console.log("Too many matching projects:")
    console.log(projects.map(it => it.name))
    return
  }
  project = projects[0]

  var timeEntryStop = new Date(timeEntry.stop)
  timeSlotter.slotsFrom(timeEntryStop).forEach((timeSlot) => {
    toggl.createTimeEntry(
      {
        description: description,
        pid: project.id,
        duration: timeSlot.duration,
        start: timeSlot.start,
        created_with: "toggl-sheet"
      }, (err) => {
        if(err) console.log(err)
        else {
          console.log("recorded \"" + description + "\" for \"" + project.name + "\" from " + timeSlot.start.toISOString() + " to " + timeSlot.end.toISOString())
        }
      })
  })
}


getLastTimeEntry(WORKSPACE).then((timeEntry) => createTimeEntryByCopying(timeEntry, args[0], args[1]))