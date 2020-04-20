import moment from 'moment'
import { Printer } from './printer'
import { Toggl } from './toggl'
import { TimeSlotter } from './timeSlotter'
import { Asker } from './asker'
import { Config } from './model/config'
import fs from 'fs'
import path from 'path'
import { Loader } from './loader'

import { homedir } from 'os'

const pluginFolder = path.join(homedir(), '.toggl-tracker')

export async function configurate (config: Config, configFile) {
  const asker = new Asker()
  const newConfig = await asker.init(config)
  fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2))
  console.log('\n### New configuration stored on ' + configFile + ' ###\n')
  return newConfig
}

export async function custom (command: string, toggl: Toggl, timeSlotter: TimeSlotter, asker: Asker, config: Config) {
  if (!fs.existsSync(path.join(pluginFolder, command + '.js'))) {
    console.log('Plugin named "' + command + '" does not exist.')
    return
  }

  const script = require(path.join(pluginFolder, command))
  await script(new Loader(), toggl, timeSlotter, asker, config)
}