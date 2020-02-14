const moment = require('moment')
WORKSPACE = process.env.TOGGL_WORKSPACE

exports.compilePicky = async (togglApi, timeSlotter, asker, config) => {
  start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  end = moment().startOf('day').add(config.lookForwardDays, 'day')

  holes = await togglApi.getTimeEntriesHoles(WORKSPACE, start, end)
  slots = await timeSlotter.slotsInMany(holes)
  selectedSlots = await asker.pickIntervals(slots)

  clients = await togglApi.getClients()
  projects = await togglApi.getProjects(WORKSPACE)
  project = await asker.chooseProject(projects, clients)
  description = await asker.whatHaveYouDone()

  togglApi.createTimeEntries(project, description, selectedSlots)
}

exports.compileAppend = async (togglApi, timeSlotter, asker, config) => {
  lastTimeEntry = await togglApi.getLastTimeEntry(WORKSPACE, moment().add(-config.lookBehindDays, 'day'), moment())
  project = await togglApi.getProject(lastTimeEntry.pid)
  description = lastTimeEntry.description
  continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity == false) {
    projects = await togglApi.getProjects(WORKSPACE)
    project = await asker.chooseProject(projects)
    description = await asker.whatHaveYouDone()
  }

  newEntryStart = moment(lastTimeEntry.stop)
  newEntryStop = moment().startOf('minutes')

  slots = await timeSlotter.slotsIn(newEntryStart, newEntryStop)
  togglApi.createTimeEntries(project, description, slots)
}
