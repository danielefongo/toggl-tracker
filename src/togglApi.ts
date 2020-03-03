import axios from 'axios'
import querystring from 'querystring'

export class TogglApi {
  private instance

  constructor (token) {
    this.instance = axios.create({
      baseURL: 'https://www.toggl.com/api/v8/',
      auth: { username: token, password: 'api_token' },
      headers: { 'Content-type': 'application/json' }
    })
  }

  async createTimeEntry (timeEntry) {
    return this.post('/time_entries', { time_entry: timeEntry })
  }

  async getTimeEntries (workspaceId, startDate, stopDate) {
    return this.get('/time_entries', {
      start_date: startDate,
      stop_date: stopDate
    })
  }

  async getActiveProjects (workspaceId) {
    return this.get('/workspaces/' + workspaceId + '/projects')
  }

  async getAllProjects (workspaceId) {
    return this.get('/workspaces/' + workspaceId + '/projects', { active: 'both' })
  }

  async getProject (projectId) {
    return this.get('/projects/' + projectId)
  }

  async getClients () {
    return this.get('/clients')
  }

  async getTasks (projectId) {
    if (projectId === undefined) return []

    var tasks = await this.get('/projects/' + projectId + '/tasks')
    if (tasks === null) tasks = []

    return tasks
  }

  async getTask (taskId) {
    if (taskId === undefined) return undefined
    return this.get('/tasks/' + taskId)
  }

  private async get (url, queryObject = undefined) {
    return this.instance.get(url + '?' + querystring.stringify(queryObject)).then(response => { return this.extractDataIfNeeded(response.data) })
  }

  private async post (url, data) {
    return this.instance.post(url, data).then(response => { return this.extractDataIfNeeded(response.data) })
  }

  private extractDataIfNeeded (payload) {
    if (payload === null || payload === undefined) return null
    return (payload.data !== undefined) ? payload.data : payload
  }
}