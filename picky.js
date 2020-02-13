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

async function holesBetween(start, end) {
  lastTimeEntries = await togglApi.getTimeEntries(WORKSPACE, start, end)

  if(lastTimeEntries.length == 0)
    return [{start,end}]

  holes = []
  for(index = 1; index < lastTimeEntries.length; index++) {
    holeStart = moment(lastTimeEntries[index - 1].stop)
    holeEnd = moment(lastTimeEntries[index].start)
    holes.push({start: holeStart, end: holeEnd})
  }
  holes.push({
    start: moment(lastTimeEntries[lastTimeEntries.length - 1].stop),
    end: end
  })

  return holes
}

async function compileToggl() {
  start = moment().add(-lookBehindDays, 'day')
  end = moment().startOf('day').add(lookForwardDays, 'day')

  holes = await holesBetween(start, end)
  slots = await timeSlotter.slotsInMany(holes)
  selectedSlots = await asker.pickIntervals(slots)

  projects = await togglApi.getProjects(WORKSPACE)
  project = await asker.chooseProject(projects)
  description = await asker.whatHaveYouDone()

  togglApi.createTimeEntries(project, description, selectedSlots)
}

compileToggl()