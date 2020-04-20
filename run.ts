import { IntervalsParser } from './src/intervalsParser'
import { Toggl } from './src/toggl'
import { TogglApi } from './src/togglApi'
import { ReportsApi } from './src/reportsApi'
import { TimeSlotter } from './src/timeSlotter'
import { Asker } from './src/asker'
import { DaysApi } from './src/daysApi'
import { configurate, custom } from './src/functions'
import { Config } from './src/model/config'
import path from 'path'
import { homedir } from 'os'
import { Actions } from './src/actions'
import { Loader } from './src/loader'
import { Git } from './src/git'
import { Files } from './src/files'

const actionFolder = path.join(homedir(), '.toggl-tracker')
const configFile = path.join(homedir(), '.toggl-tracker.json')

function run (command, subcommand, config: Config) {
  var git = new Git()
  var files = new Files()
  var asker = new Asker()
  var parser = new IntervalsParser()
  var intervals = parser.parse(config.workingHoursIntervals)
  var daysApi = new DaysApi(config.workingDays, config.googleToken, config.googleLocale)
  var toggl = new Toggl(new TogglApi(config.togglToken), new ReportsApi(config.togglToken), config.togglWorkspace)
  var timeSlotter = new TimeSlotter(daysApi, intervals)
  var actions = new Actions(files, git, actionFolder, new Loader(), toggl, timeSlotter, asker, config)

  switch (command) {
    case 'config':
      configurate(config, configFile)
      break
    case 'install':
      actions.install(subcommand)
      break
    case 'run':
      actions.run(subcommand)
      break
    case 'help':
      actions.help()
      break
    default:
      custom(subcommand, toggl, timeSlotter, asker, config)
      break
  }
}

export { run }