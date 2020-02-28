const moment = require('moment')
const printer = require('./printer')

module.exports = function (togglApi) {
  this.api = togglApi

  this.createTimeEntries = async function (project, task, description, timeSlots) {
    const self = this
    timeSlots.forEach((timeSlot, index) => {
      setTimeout(function timer () {
        self.createTimeEntry(project, task, description, timeSlot)
          .catch(console.log)
      }, index * 100)
    })
  }

  this.createTimeEntry = async function (project, task, description, timeSlot) {
    return this.api.createTimeEntry({
      description: description,
      pid: project.id,
      tid: task.id,
      billable: project.billable,
      duration: timeSlot.duration,
      start: date(timeSlot.start),
      stop: date(timeSlot.end),
      created_with: 'toggl-tracker'
    }).then(entry => {
      printer.entry(project, timeSlot.start, timeSlot.end)
      return entry
    })
  }

  this.getTimeEntries = async function (workspaceId, fromMoment, toMoment) {
    const entries = await this.api.getTimeEntries(workspaceId, fromMoment.format(), toMoment.format())
    return entries
      .filter(element => element.wid.toString() === workspaceId)
      .map(useMoment)
  }

  this.getTimeEntriesHoles = async function (workspaceId, fromMoment, toMoment) {
    var entries = await this.getTimeEntries(workspaceId, fromMoment, toMoment)

    entries.unshift({ stop: fromMoment })
    entries.push({ start: toMoment })

    return entries
      .slice(1)
      .map((_, idx) => {
        return {
          start: entries[idx].stop,
          end: entries[idx + 1].start
        }
      })
      .filter(it => it.end.diff(it.start) > 0)
  }

  this.getLastTimeEntry = async function (workspaceId, fromMoment, toMoment) {
    const timeEntries = await this.getTimeEntries(workspaceId, fromMoment, toMoment)
    return timeEntries.pop()
  }

  this.getActiveProjects = async function (workspaceId) {
    const projects = await this.api.getActiveProjects(workspaceId)
    projects.unshift(emptyProject())
    return projects
  }

  this.getAllProjects = async function (workspaceId) {
    const projects = await this.api.getAllProjects(workspaceId)
    projects.unshift(emptyProject())
    return projects
  }

  this.getClients = async function () {
    return this.api.getClients()
  }

  this.getProject = async function (projectId) {
    return this.api.getProject(projectId)
  }

  this.getTasks = async function (projectId) {
    const tasks = await this.api.getTasks(projectId)
    tasks.push(emptyTask())
    return tasks
  }

  this.getTask = async function (taskId) {
    const task = await this.api.getTask(taskId)
    return task !== undefined ? task : emptyTask()
  }

  function date (moment) {
    return moment.toDate()
  }

  function useMoment (it) {
    it.start = moment(it.start)
    it.stop = moment(it.stop)
    return it
  }

  function emptyTask () {
    return { id: null, name: '[no task]' }
  }

  function emptyProject () {
    return { id: undefined, name: 'NO PROJECT' }
  }
}
