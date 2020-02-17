const moment = require('moment')
const WORKSPACE = process.env.TOGGL_WORKSPACE

exports.compilePicky = async (togglApi, timeSlotter, asker, config) => {
  const start = moment().startOf('day').add(-config.lookBehindDays, 'day')
  const end = moment().startOf('day').add(config.lookForwardDays, 'day')

  const holes = await togglApi.getTimeEntriesHoles(WORKSPACE, start, end)
  const slots = await timeSlotter.slotsInMany(holes)
  const selectedSlots = await asker.pickIntervals(slots)

  const {project, description} = await chooseProjectAndDescription(togglApi, asker)

  togglApi.createTimeEntries(project, description, selectedSlots)
}

exports.compileAppend = async (togglApi, timeSlotter, asker, config) => {
  const lastTimeEntry = await togglApi.getLastTimeEntry(WORKSPACE, moment().add(-config.lookBehindDays, 'day'), moment())
  var {project, description} = await getProjectAndDescriptionFrom(lastTimeEntry, togglApi)
  
  const continueLastActivity = await asker.shouldContinueLastActivity(project.name, description)

  if (continueLastActivity === false) {
    var {project, description} = await chooseProjectAndDescription(togglApi, asker)
  }

  const newEntryStart = moment(lastTimeEntry.stop)
  const newEntryStop = moment().startOf('minutes')

  const slots = await timeSlotter.slotsIn(newEntryStart, newEntryStop)
  togglApi.createTimeEntries(project, description, slots)
}

async function chooseProjectAndDescription(togglApi, asker) {
  const clients = await togglApi.getClients()
  const projects = await togglApi.getProjects(WORKSPACE)
  const project = await asker.chooseProject(projects, clients)
  const description = await asker.whatHaveYouDone()

  return {project, description}
}

async function getProjectAndDescriptionFrom(timeEntry, togglApi) {
  var project = await togglApi.getProject(timeEntry.pid)
  var description = timeEntry.description
  
  return {project, description}
}