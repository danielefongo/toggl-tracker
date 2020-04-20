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

export async function compilePicky (toggl: Toggl, timeSlotter: TimeSlotter, asker: Asker, config: Config) {
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().endOf('day').add(config.lookForwardDays, 'day')

  const holes = await toggl.getTimeEntriesHoles(start, end)
  const slots = await timeSlotter.slotsInMany(holes)
  const selectedSlots = await asker.pickSlots(slots)
  const squashedSlots = await timeSlotter.squash(selectedSlots)

  const { project, task, description } = await chooseProjectTaskAndDescription(toggl, asker)

  toggl.createTimeEntries(project, task, description, squashedSlots)
}

export async function check (toggl: Toggl, asker: Asker) {
  const granularity = await asker.chooseGranularity()
  const start = moment().startOf(granularity)
  const end = moment().endOf(granularity)
  const projects = await toggl.getAllProjects()

  toggl.getTimeEntries(start, end).then(entries => {
    entries.forEach(entry => {
      const project = projects.filter(project => project.id === entry.pid)[0]
      Printer.entry(project, entry.slot)
    })
  })
}

export async function summary (toggl: Toggl, asker: Asker) {
  const granularity = await asker.chooseGranularity()
  const start = moment().startOf(granularity)
  const end = moment().endOf(granularity)
  const summary = await toggl.getSummary(start, end)

  summary.forEach(it => console.log(it.description))
}

export async function custom (command: string, toggl: Toggl, timeSlotter: TimeSlotter, asker: Asker, config: Config) {
  if (!fs.existsSync(path.join(pluginFolder, command + '.js'))) {
    console.log('Plugin named "' + command + '" does not exist.')
    return
  }

  const script = require(path.join(pluginFolder, command))
  await script(new Loader(), toggl, timeSlotter, asker, config)
}

async function chooseProjectTaskAndDescription (toggl: Toggl, asker: Asker) {
  const clients = await toggl.getClients()
  const projects = await toggl.getActiveProjects()
  const project = await asker.chooseProject(projects, clients)
  const tasks = await toggl.getTasks(project.id)

  const task = tasks.length > 1 ? await asker.chooseTask(tasks) : tasks[0]
  const description = await asker.inquire('What have you done?')

  return { project, task, description }
}