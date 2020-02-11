require('dotenv').config()
const Toggl = require('./togglApi');
const TimeSlotter = require('./timeSlotter')
const Asker = require('./asker')
const DaysApi = require('./daysApi');

GOOGLE_API_TOKEN=process.env.GOOGLE_TOKEN
GOOGLE_API_LOCALE=process.env.GOOGLE_LOCALE
TOGGL_API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

const config = require('./config.json')
const intervals = config.utcWorkingHoursIntervals

var daysApi = new DaysApi(GOOGLE_API_TOKEN, GOOGLE_API_LOCALE)
var togglApi = new Toggl(TOGGL_API_TOKEN);
var timeSlotter = new TimeSlotter(daysApi, intervals)
var asker = new Asker()

async function createTimeEntry(start, end, project, description) {
  slots = await timeSlotter.slotsIn(start, end)
  togglApi.createTimeEntries(project, description, slots)
}

async function compileToggl() {
  lastTimeEntry = await togglApi.getLastTimeEntry(WORKSPACE)
  project = await togglApi.getProject(lastTimeEntry.pid)
  description = lastTimeEntry.description
  continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity == false) {
    projects = await togglApi.getProjects(WORKSPACE)
    project = await asker.chooseProject(projects)
    description = await asker.whatHaveYouDone()
  }
  
  now = new Date()
  newEntryStart = new Date(lastTimeEntry.stop)
  newEntryStop = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()))

  createTimeEntry(newEntryStart, newEntryStop, project, description)
}

compileToggl()