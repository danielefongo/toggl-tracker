import { IntervalsParser } from './src/intervalsParser'
import { Toggl } from './src/toggl'
import { TogglApi } from './src/togglApi'
import { ReportsApi } from './src/reportsApi'
import { TimeSlotter } from './src/timeSlotter'
import { Asker } from './src/asker'
import { DaysApi } from './src/daysApi'
import { check, compileAppend, compilePicky, summary } from './src/functions'

function compile (command, config) {
  var parser = new IntervalsParser()
  var intervals = parser.parse(config.workingHoursIntervals)
  var daysApi = new DaysApi(config.workingDays, config.googleToken, config.googleLocale)
  var toggl = new Toggl(new TogglApi(config.togglToken), new ReportsApi(config.togglToken), config.togglWorkspace)
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
      check(toggl, asker)
      break
    case 'summary':
      summary(toggl, asker)
      break
    default:
      showHelp()
  }
}

function showHelp () {
  console.log('Use one of the following commands:')
  console.log('- append: use it to record from the last recorded activity.')
  console.log('- picky: use it to compile not-filled selected past (and future) holes.')
  console.log('- check: use it to show inserted entries.')
  console.log('- summary: use it to show a summary of tracked hours for all projects in the workspace.')
  console.log('- config: use it to change configuration.')
}

export { compile }