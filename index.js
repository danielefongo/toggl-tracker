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

async function createTimeEntry(start, end, project, description) {
  slots = timeSlotter.slotsIn(start, end)
  toggl.createTimeEntries(project, description, slots)
}

async function compileToggl() {
  lastTimeEntry = await toggl.getLastTimeEntry(WORKSPACE)
  project = await toggl.getProject(lastTimeEntry.pid)
  description = lastTimeEntry.description
  continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity == false) {
    projects = await toggl.getProjects(WORKSPACE)
    description = await asker.whatHaveYouDone()
    project = await asker.chooseProject(projects)
  }
  
  now = new Date()
  newEntryStart = new Date(lastTimeEntry.stop)
  newEntryStop = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()))

  createTimeEntry(newEntryStart, newEntryStop, project, description)
}

compileToggl()