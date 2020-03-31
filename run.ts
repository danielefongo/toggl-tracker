import { IntervalsParser } from './src/intervalsParser'
import { Toggl } from './src/toggl'
import { TogglApi } from './src/togglApi'
import { ReportsApi } from './src/reportsApi'
import { TimeSlotter } from './src/timeSlotter'
import { Asker } from './src/asker'
import { DaysApi } from './src/daysApi'
import { check, compileAppend, compilePicky, configurate, summary, custom } from './src/functions'
import { Config } from './src/model/config'
import path from 'path'
import { homedir } from 'os'

const configFile = path.join(homedir(), '.toggl-tracker.json')

function run (command, subcommand, config: Config) {
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
    case 'config':
      configurate(config, configFile)
      break
    default:
      custom(subcommand, toggl, timeSlotter, asker, config)
      break
  }
}

export { run }