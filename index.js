const path = require('path')
const fs = require('fs')
const configFile = path.join(require('os').homedir(), '.toggle-compile.json')

if (!fs.existsSync(configFile)) {
  console.log('run `npm run init` to configure app.')
  return
}

const IntervalsParser = require('./intervalsParser')
const Toggl = require('./togglApi')
const TimeSlotter = require('./timeSlotter')
const Asker = require('./asker')
const DaysApi = require('./daysApi')
const { compilePicky, compileAppend } = require('./compileFunctions')

const config = require(configFile)

var parser = new IntervalsParser()
var intervals = parser.parse(config.workingHoursIntervals)
var daysApi = new DaysApi(config.workingDays, config.googleToken, config.googleLocale)
var togglApi = new Toggl(config.togglToken)
var timeSlotter = new TimeSlotter(daysApi, intervals)
var asker = new Asker()

const command = process.argv.slice(2)[0]
switch (command) {
  case 'picky': compilePicky(togglApi, timeSlotter, asker, config); break
  case 'append': compileAppend(togglApi, timeSlotter, asker, config); break
  default: console.log('Use picky or append as command')
}
