require('dotenv').config()
const Toggl = require('./togglApi')
const TimeSlotter = require('./timeSlotter')
const Asker = require('./asker')
const DaysApi = require('./daysApi')
const { compilePicky, compileAppend } = require('./compileFunctions')

const GOOGLE_API_TOKEN = process.env.GOOGLE_TOKEN
const GOOGLE_API_LOCALE = process.env.GOOGLE_LOCALE
const TOGGL_API_TOKEN = process.env.TOGGL_TOKEN

const config = require('./config.json')
const intervals = config.workingHoursIntervals
const workingDays = config.workingDays

var daysApi = new DaysApi(workingDays, GOOGLE_API_TOKEN, GOOGLE_API_LOCALE)
var togglApi = new Toggl(TOGGL_API_TOKEN)
var timeSlotter = new TimeSlotter(daysApi, intervals)
var asker = new Asker()

const command = process.argv.slice(2)[0]
switch (command) {
  case 'picky': compilePicky(togglApi, timeSlotter, asker, config); break
  case 'append': compileAppend(togglApi, timeSlotter, asker, config); break
  default: console.log('Use picky or append as command')
}
