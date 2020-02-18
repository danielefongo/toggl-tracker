const moment = require('moment')
const WORKSPACE = process.env.TOGGL_WORKSPACE

exports.compilePicky = async (togglApi, timeSlotter, asker, config) => {
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().startOf('day').add(config.lookForwardDays, 'day')

  const holes = await togglApi.getTimeEntriesHoles(WORKSPACE, start, end)
  const slots = await timeSlotter.slotsInMany(holes)
  const selectedSlots = await asker.pickIntervals(slots)

  const {project, task, description} = await chooseProjectTaskAndDescription(togglApi, asker)

  togglApi.createTimeEntries(project, task, description, selectedSlots)
}

exports.compileAppend = async (togglApi, timeSlotter, asker, config) => {
  const lastTimeEntry = await togglApi.getLastTimeEntry(WORKSPACE, moment().add(-config.lookBehindDays, 'day'), moment())
  var {project, task, description} = await getProjectTaskAndDescriptionFrom(lastTimeEntry, togglApi)
  
  const continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity === false) {
    var {project, task, description} = await chooseProjectTaskAndDescription(togglApi, asker)
  }

  const newEntryStart = moment(lastTimeEntry.stop)
  const newEntryStop = moment().startOf('minutes')

  const slots = await timeSlotter.slotsIn(newEntryStart, newEntryStop)
  togglApi.createTimeEntries(project, task, description, slots)
}

async function chooseProjectTaskAndDescription(togglApi, asker) {
  const clients = await togglApi.getClients()
  const projects = await togglApi.getProjects(WORKSPACE)
  const project = await asker.chooseProject(projects, clients)
  const tasks = await togglApi.getTasks(project.id)

  const task = tasks.length > 1 ? await asker.chooseTask(tasks) : tasks[0]
  const description = await asker.whatHaveYouDone()

  return {project, task, description}
}

async function getProjectTaskAndDescriptionFrom(timeEntry, togglApi) {
  const project = await togglApi.getProject(timeEntry.pid)
  const task = await togglApi.getTask(timeEntry.tid)
  const description = timeEntry.description
  
  return {project, task, description}
}