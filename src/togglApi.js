const moment = require('moment')
const axios = require('axios')
const querystring = require('querystring')
const printer = require('./printer')

module.exports = function (token) {
  this.createTimeEntries = async function (project, task, description, timeSlots) {
    const self = this
    timeSlots.forEach((timeSlot, index) => {
      setTimeout(function timer () {
        self.createSingleTimeEntry(project, task, description, timeSlot)
          .catch(console.log)
      }, index * 100)
    })
  }

  this.createSingleTimeEntry = async function (project, task, description, timeSlot) {
    return post('/time_entries', {
      time_entry: {
        description: description,
        pid: project.id,
        tid: task.id,
        billable: project.billable,
        duration: timeSlot.duration,
        start: date(timeSlot.start),
        stop: date(timeSlot.end),
        created_with: 'toggl-tracker'
      }
    }).then(entry => {
      printer.entry(project, timeSlot.start, timeSlot.end)
      return entry
    })
  }

  this.getTimeEntries = async function (workspaceId, fromMoment, toMoment) {
    const entries = await get('/time_entries', {
      start_date: fromMoment.format(),
      stop_date: toMoment.format()
    })
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
    return getProjects(workspaceId)
  }

  this.getAllProjects = async function (workspaceId) {
    return getProjects(workspaceId, { active: 'both' })
  }

  this.getClients = async function () {
    return get('/clients')
  }

  this.getProject = async function (projectId) {
    return get('/projects/' + projectId)
  }

  this.getTasks = async function (projectId) {
    if (projectId === undefined) return [emptyTask()]

    var tasks = await get('/projects/' + projectId + '/tasks')
    if (tasks === null) tasks = []
    tasks.push(emptyTask())

    return tasks
  }

  this.getTask = async function (taskId) {
    if (taskId === undefined) return emptyTask()
    return get('/tasks/' + taskId)
  }

  async function getProjects (workspaceId, queryObject) {
    const projects = await get('/workspaces/' + workspaceId + '/projects', queryObject)
    projects.unshift(emptyProject())
    return projects
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

  async function get (url, queryObject) {
    return instance.get(url + '?' + querystring.stringify(queryObject)).then(response => { return extractDataIfNeeded(response.data) })
  }

  async function post (url, data) {
    return instance.post(url, data).then(response => { return extractDataIfNeeded(response.data) })
  }

  function extractDataIfNeeded (payload) {
    if (payload === null || payload === undefined) return null
    return (payload.data !== undefined) ? payload.data : payload
  }

  const instance = axios.create({
    baseURL: 'https://www.toggl.com/api/v8/',
    auth: { username: token, password: 'api_token' },
    headers: { 'Content-type': 'application/json' }
  })
}
