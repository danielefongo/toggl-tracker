const IntervalsParser = require('./src/intervalsParser')
const Toggl = require('./src/toggl')
const TogglApi = require('./src/togglApi')
const TimeSlotter = require('./src/timeSlotter')
const Asker = require('./src/asker')
const DaysApi = require('./src/daysApi')
const { compilePicky, compileAppend, check } = require('./src/functions')

exports.compile = function (command, config) {
  var parser = new IntervalsParser()
  var intervals = parser.parse(config.workingHoursIntervals)
  var daysApi = new DaysApi(config.workingDays, config.googleToken, config.googleLocale)
  var toggl = new Toggl(new TogglApi(config.togglToken))
  var timeSlotter = new TimeSlotter(daysApi, intervals)
  var asker = new Asker()

  switch (command) {
    case 'picky': compilePicky(toggl, timeSlotter, asker, config); break
    case 'append': compileAppend(toggl, timeSlotter, asker, config); break
    case 'check': check(toggl, config); break
    default: showHelp()
  }
}

function showHelp () {
  console.log('Use one of the following commands:')
  console.log('- append: use it to record from the last recorded activity.')
  console.log('- picky: use it to compile not-filled selected past (and future) holes.')
  console.log('- check: use it show last inserted entries.')
  console.log('- config: use it to change configuration.')
}
