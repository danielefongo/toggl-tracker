const moment = require('moment')
const printer = require('./printer')

exports.compilePicky = async (togglApi, timeSlotter, asker, config) => {
  const workspace = config.togglWorkspace
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().startOf('day').add(config.lookForwardDays, 'day')

  const holes = await togglApi.getTimeEntriesHoles(workspace, start, end)
  const slots = await timeSlotter.slotsInMany(holes)
  const selectedSlots = await asker.pickIntervals(slots)

  const { project, task, description } = await chooseProjectTaskAndDescription(workspace, togglApi, asker)

  togglApi.createTimeEntries(project, task, description, selectedSlots)
}

exports.compileAppend = async (togglApi, timeSlotter, asker, config) => {
  const workspace = config.togglWorkspace
  const lastTimeEntry = await togglApi.getLastTimeEntry(workspace, moment().add(-config.lookBehindDays, 'day'), moment())
  var { project, task, description } = await getProjectTaskAndDescriptionFrom(lastTimeEntry, togglApi)

  const continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity === false) {
    var { project, task, description } = await chooseProjectTaskAndDescription(workspace, togglApi, asker)
  }

  const newEntryStart = moment(lastTimeEntry.stop)
  const newEntryStop = moment().startOf('minutes')

  const slots = await timeSlotter.slotsIn(newEntryStart, newEntryStop)
  togglApi.createTimeEntries(project, task, description, slots)
}

exports.check = async (togglApi, config) => {
  const workspace = config.togglWorkspace
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().startOf('day').add(config.lookForwardDays, 'day')
  const projects = await togglApi.getAllProjects(workspace)

  togglApi.getTimeEntries(workspace, start, end).then(entries => {
    entries.forEach(entry => {
      const project = projects.filter(project => project.id === entry.pid)[0]
      printer.entry(project, entry.start, entry.stop)
    })
  })
}

async function chooseProjectTaskAndDescription (workspace, togglApi, asker) {
  const clients = await togglApi.getClients()
  const projects = await togglApi.getActiveProjects(workspace)
  const project = await asker.chooseProject(projects, clients)
  const tasks = await togglApi.getTasks(project.id)

  const task = tasks.length > 1 ? await asker.chooseTask(tasks) : tasks[0]
  const description = await asker.whatHaveYouDone()

  return { project, task, description }
}

async function getProjectTaskAndDescriptionFrom (timeEntry, togglApi) {
  const project = await togglApi.getProject(timeEntry.pid)
  const task = await togglApi.getTask(timeEntry.tid)
  const description = timeEntry.description

  return { project, task, description }
}
