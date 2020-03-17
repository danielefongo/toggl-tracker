import moment from 'moment'
import { Printer } from './printer'
import { Toggl } from './toggl'
import { TimeSlotter } from './timeSlotter'
import { Asker } from './asker'
import { TimeSlot } from './model/timeSlot'
import { Entry } from './model/entry'
import { Config } from './model/config'
import fs from "fs"

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

export async function compileAppend (toggl: Toggl, timeSlotter: TimeSlotter, asker: Asker, config: Config) {
  const lastTimeEntry = await toggl.getLastTimeEntry(moment().add(-config.lookBehindDays, 'day'), moment())
  var { project, task, description } = await getProjectTaskAndDescriptionFrom(lastTimeEntry, toggl)

  const continueLastActivity = await asker.shouldContinueLastActivity(project.description, description)

  if (!continueLastActivity) {
    ({ project, task, description } = await chooseProjectTaskAndDescription(toggl, asker))
  }

  const newEntryStart = moment(lastTimeEntry.slot.end)
  const newEntryStop = moment().startOf('minutes')

  const slots = await timeSlotter.slotsIn(new TimeSlot(newEntryStart, newEntryStop))
  toggl.createTimeEntries(project, task, description, slots)
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

async function chooseProjectTaskAndDescription (toggl: Toggl, asker: Asker) {
  const clients = await toggl.getClients()
  const projects = await toggl.getActiveProjects()
  const project = await asker.chooseProject(projects, clients)
  const tasks = await toggl.getTasks(project.id)

  const task = tasks.length > 1 ? await asker.chooseTask(tasks) : tasks[0]
  const description = await asker.whatHaveYouDone()

  return { project, task, description }
}

async function getProjectTaskAndDescriptionFrom (timeEntry: Entry, toggl: Toggl) {
  const project = await toggl.getProject(timeEntry.pid)
  const task = await toggl.getTask(timeEntry.tid)
  const description = timeEntry.description

  return { project, task, description }
}
