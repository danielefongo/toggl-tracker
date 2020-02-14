const moment = require('moment')
const WORKSPACE = process.env.TOGGL_WORKSPACE

exports.compilePicky = async (togglApi, timeSlotter, asker, config) => {
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().startOf('day').add(config.lookForwardDays, 'day')

  const holes = await togglApi.getTimeEntriesHoles(WORKSPACE, start, end)
  const slots = await timeSlotter.slotsInMany(holes)
  const selectedSlots = await asker.pickIntervals(slots)

  const clients = await togglApi.getClients()
  const projects = await togglApi.getProjects(WORKSPACE)
  const project = await asker.chooseProject(projects, clients)
  const description = await asker.whatHaveYouDone()

  togglApi.createTimeEntries(project, description, selectedSlots)
}

exports.compileAppend = async (togglApi, timeSlotter, asker, config) => {
  const lastTimeEntry = await togglApi.getLastTimeEntry(WORKSPACE, moment().add(-config.lookBehindDays, 'day'), moment())
  var project = await togglApi.getProject(lastTimeEntry.pid)
  var description = lastTimeEntry.description
  const continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity === false) {
    const projects = await togglApi.getProjects(WORKSPACE)
    const clients = await togglApi.getClients()
    project = await asker.chooseProject(projects, clients)
    description = await asker.whatHaveYouDone()
  }

  const newEntryStart = moment(lastTimeEntry.stop)
  const newEntryStop = moment().startOf('minutes')

  const slots = await timeSlotter.slotsIn(newEntryStart, newEntryStop)
  togglApi.createTimeEntries(project, description, slots)
}
