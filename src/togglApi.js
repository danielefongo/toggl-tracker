const axios = require('axios')
const querystring = require('querystring')

module.exports = function (token) {
  this.createTimeEntry = async function (timeEntry) {
    return post('/time_entries', { time_entry: timeEntry })
  }

  this.getTimeEntries = async function (workspaceId, startDate, stopDate) {
    return get('/time_entries', {
      start_date: startDate,
      stop_date: stopDate
    })
  }

  this.getActiveProjects = async function (workspaceId) {
    return get('/workspaces/' + workspaceId + '/projects')
  }

  this.getAllProjects = async function (workspaceId) {
    return get('/workspaces/' + workspaceId + '/projects', { active: 'both' })
  }

  this.getProject = async function (projectId) {
    return get('/projects/' + projectId)
  }

  this.getClients = async function () {
    return get('/clients')
  }

  this.getTasks = async function (projectId) {
    if (projectId === undefined) return []

    var tasks = await get('/projects/' + projectId + '/tasks')
    if (tasks === null) tasks = []

    return tasks
  }

  this.getTask = async function (taskId) {
    if (taskId === undefined) return undefined
    return get('/tasks/' + taskId)
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
