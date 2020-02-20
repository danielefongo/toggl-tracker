const TogglClient = require('toggl-api')
const moment = require('moment')

module.exports = function (token) {
  this.toggl = new TogglClient({ apiToken: token })

  this.createTimeEntries = async function (project, task, description, timeSlots) {
    const self = this
    timeSlots.forEach((timeSlot, index) => {
      setTimeout(function timer () {
        self.createSingleTimeEntry(project, task, description, timeSlot)
          .then(_ => console.log('recorded "' + description + '" on project "' + project.name + '" for ' + timeSlot.start.format('MMM DD') + ', from ' + timeSlot.start.format('HH:mm') + ' to ' + timeSlot.end.format('HH:mm')))
          .catch(console.log)
      }, index * 100)
    })
  }

  this.createSingleTimeEntry = async function (project, task, description, timeSlot) {
    return new Promise((resolve, reject) => {
      this.toggl.createTimeEntry({
        description: description,
        pid: project.id,
        tid: task.id,
        billable: project.billable,
        duration: timeSlot.duration,
        start: date(timeSlot.start),
        stop: date(timeSlot.end),
        created_with: 'toggl-tracker'
      }, (err, data) => {
        if (err) { reject(err) }
        resolve(data)
      })
    })
  }

  this.getTimeEntries = async function (workspaceId, fromMoment, toMoment) {
    return new Promise((resolve, reject) => {
      this.toggl.getTimeEntries(date(fromMoment), date(toMoment), function (err, data) {
        if (err) reject(err)
        resolve(data
          .filter(element => element.wid.toString() === workspaceId)
          .map(useMoment)
        )
      })
    })
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

  this.getProjects = async function (workspaceId) {
    return new Promise((resolve, reject) => {
      this.toggl.getWorkspaceProjects(workspaceId, {}, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  this.getClients = async function () {
    return new Promise((resolve, reject) => {
      this.toggl.getClients(function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  this.getProject = async function (projectId) {
    return new Promise((resolve, reject) => {
      this.toggl.getProjectData(projectId, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  this.getTasks = async function (projectId) {
    return new Promise((resolve, reject) => {
      this.toggl.getProjectTasks(projectId, function (err, data) {
        if (data === null) data = []
        if (err) reject(err)

        data.push(emptyTask())
        resolve(data)
      })
    })
  }

  this.getTask = async function (taskId) {
    if (taskId === undefined) return emptyTask()
    return new Promise((resolve, reject) => {
      this.toggl.getTaskData(taskId, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })
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
}
