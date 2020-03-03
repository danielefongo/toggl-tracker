import { IntervalsParser } from './src/intervalsParser'
import { Toggl } from './src/toggl'
import { TogglApi } from './src/togglApi'
import { TimeSlotter } from './src/timeSlotter'
import { Asker } from './src/asker'
import { DaysApi } from './src/daysApi'
import { check, compileAppend, compilePicky } from './src/functions'

function compile (command, config) {
  var parser = new IntervalsParser()
  var intervals = parser.parse(config.workingHoursIntervals)
  var daysApi = new DaysApi(config.workingDays, config.googleToken, config.googleLocale)
  var toggl = new Toggl(new TogglApi(config.togglToken))
  var timeSlotter = new TimeSlotter(daysApi, intervals)
  var asker = new Asker()

  switch (command) {
    case 'picky':
      compilePicky(toggl, timeSlotter, asker, config)
      break
    case 'append':
      compileAppend(toggl, timeSlotter, asker, config)
      break
    case 'check':
      check(toggl, config)
      break
    default:
      showHelp()
  }
}

function showHelp () {
  console.log('Use one of the following commands:')
  console.log('- append: use it to record from the last recorded activity.')
  console.log('- picky: use it to compile not-filled selected past (and future) holes.')
  console.log('- check: use it show last inserted entries.')
  console.log('- config: use it to change configuration.')
}

export { compile }