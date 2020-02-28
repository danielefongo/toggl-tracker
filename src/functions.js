const moment = require('moment')
const printer = require('./printer')

exports.compilePicky = async (toggl, timeSlotter, asker, config) => {
  const workspace = config.togglWorkspace
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().startOf('day').add(config.lookForwardDays, 'day')

  const holes = await toggl.getTimeEntriesHoles(workspace, start, end)
  const slots = await timeSlotter.slotsInMany(holes)
  const selectedSlots = await asker.pickIntervals(slots)

  const { project, task, description } = await chooseProjectTaskAndDescription(workspace, toggl, asker)

  toggl.createTimeEntries(project, task, description, selectedSlots)
}

exports.compileAppend = async (toggl, timeSlotter, asker, config) => {
  const workspace = config.togglWorkspace
  const lastTimeEntry = await toggl.getLastTimeEntry(workspace, moment().add(-config.lookBehindDays, 'day'), moment())
  var { project, task, description } = await getProjectTaskAndDescriptionFrom(lastTimeEntry, toggl)

  const continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity === false) {
    var { project, task, description } = await chooseProjectTaskAndDescription(workspace, toggl, asker)
  }

  const newEntryStart = moment(lastTimeEntry.stop)
  const newEntryStop = moment().startOf('minutes')

  const slots = await timeSlotter.slotsIn(newEntryStart, newEntryStop)
  toggl.createTimeEntries(project, task, description, slots)
}

exports.check = async (toggl, config) => {
  const workspace = config.togglWorkspace
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().startOf('day').add(config.lookForwardDays, 'day')
  const projects = await toggl.getAllProjects(workspace)

  toggl.getTimeEntries(workspace, start, end).then(entries => {
    entries.forEach(entry => {
      const project = projects.filter(project => project.id === entry.pid)[0]
      printer.entry(project, entry.start, entry.stop)
    })
  })
}

async function chooseProjectTaskAndDescription (workspace, toggl, asker) {
  const clients = await toggl.getClients()
  const projects = await toggl.getActiveProjects(workspace)
  const project = await asker.chooseProject(projects, clients)
  const tasks = await toggl.getTasks(project.id)

  const task = tasks.length > 1 ? await asker.chooseTask(tasks) : tasks[0]
  const description = await asker.whatHaveYouDone()

  return { project, task, description }
}

async function getProjectTaskAndDescriptionFrom (timeEntry, toggl) {
  const project = await toggl.getProject(timeEntry.pid)
  const task = await toggl.getTask(timeEntry.tid)
  const description = timeEntry.description

  return { project, task, description }
}
