require('dotenv').config()
const Toggl = require('./toggl');
const TimeSlotter = require('./timeSlotter')
const Asker = require('./asker')

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

const UTCHoursInterval = require('./utcHoursInterval')
const intervals = [new UTCHoursInterval(8, 12), new UTCHoursInterval(13, 17)]

var toggl = new Toggl(API_TOKEN);
var timeSlotter = new TimeSlotter(intervals)
var asker = new Asker()

async function createTimeEntry(timeEntry, project, description) {
  var timeEntryStop = new Date(timeEntry.stop)
  var now = new Date()

  timeSlotter.slotsIn(timeEntryStop, now).forEach((timeSlot, index) => {
    setTimeout(function timer() {
      toggl.createTimeEntry(project, description, timeSlot)
      .then(_ => {
        console.log("recorded \"" + description + "\" for \"" + project.name + "\" from " + timeSlot.start.toISOString() + " to " + timeSlot.end.toISOString())
      })
      .catch(console.log)
    }, index * 100);
  })
}

async function compileToggl() {
  lastTimeEntry = await toggl.getLastTimeEntry(WORKSPACE)
  lastTimeEntryProject = await toggl.getProject(lastTimeEntry.pid)
  lastTimeEntryProjectName = lastTimeEntryProject.name
  lastTimeEntryDescription = lastTimeEntry.description

  continueLastActivity = await asker.shouldContinueLastActivity(lastTimeEntryProjectName, lastTimeEntryDescription)

  if (continueLastActivity == true)
    createTimeEntry(lastTimeEntry, lastTimeEntryProject, lastTimeEntryDescription)
  else {
    projects = await toggl.getProjects(WORKSPACE)
    description = await asker.whatHaveYouDone()
    project = await asker.chooseProject(projects)
    createTimeEntry(lastTimeEntry, project, description)
  }
}

compileToggl()