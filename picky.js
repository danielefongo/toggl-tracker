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
const lookForwardDays = config.lookForwardDays

var daysApi = new DaysApi(workingDays, GOOGLE_API_TOKEN, GOOGLE_API_LOCALE)
var togglApi = new Toggl(TOGGL_API_TOKEN);
var timeSlotter = new TimeSlotter(daysApi, intervals)
var asker = new Asker()

async function compileToggl() {
  start = moment().startOf('day').add(-lookBehindDays, 'day')
  end = moment().startOf('day').add(lookForwardDays, 'day')
  
  holes = await togglApi.getTimeEntriesHoles(WORKSPACE, start, end)
  slots = await timeSlotter.slotsInMany(holes)
  selectedSlots = await asker.pickIntervals(slots)

  clients = await togglApi.getClients()
  projects = await togglApi.getProjects(WORKSPACE)
  project = await asker.chooseProject(projects, clients)
  description = await asker.whatHaveYouDone()

  togglApi.createTimeEntries(project, description, selectedSlots)
}

compileToggl()