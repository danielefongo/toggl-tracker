require('dotenv').config()
const Toggl = require('./togglApi');
const TimeSlotter = require('./timeSlotter')
const Asker = require('./asker')
const DaysApi = require('./daysApi');
const moment = require('moment')

GOOGLE_API_TOKEN=process.env.GOOGLE_TOKEN
GOOGLE_API_LOCALE=process.env.GOOGLE_LOCALE
TOGGL_API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

const config = require('./config.json')
const intervals = config.workingHoursIntervals
const workingDays = config.workingDays
const lookBehindDays = config.lookBehindDays

var daysApi = new DaysApi(workingDays, GOOGLE_API_TOKEN, GOOGLE_API_LOCALE)
var togglApi = new Toggl(TOGGL_API_TOKEN);
var timeSlotter = new TimeSlotter(daysApi, intervals)
var asker = new Asker()

async function compileToggl() {
  lastTimeEntry = await togglApi.getLastTimeEntry(WORKSPACE, moment().add(-lookBehindDays, 'day'), moment())
  project = await togglApi.getProject(lastTimeEntry.pid)
  description = lastTimeEntry.description
  continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity == false) {
    projects = await togglApi.getProjects(WORKSPACE)
    project = await asker.chooseProject(projects)
    description = await asker.whatHaveYouDone()
  }
  
  newEntryStart = moment(lastTimeEntry.stop)
  newEntryStop = moment().startOf('minutes')

  slots = await timeSlotter.slotsIn(newEntryStart, newEntryStop)
  togglApi.createTimeEntries(project, description, slots)
}

compileToggl()