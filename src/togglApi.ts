import axios, { AxiosInstance } from 'axios'
import querystring from 'querystring'

export class TogglApi {
  private instance: AxiosInstance

  constructor (token: string) {
    this.instance = axios.create({
      baseURL: 'https://api.track.toggl.com/api/v8/',
      auth: { username: token, password: 'api_token' },
      headers: { 'Content-type': 'application/json' }
    })
  }

  async createTimeEntry (timeEntry: any) {
    await this.sleep()
    return this.post('/time_entries', { time_entry: timeEntry })
  }

  async getTimeEntries (startDateString: string, stopDateString: string) {
    return this.get('/time_entries', {
      start_date: startDateString,
      end_date: stopDateString
    })
  }

  async getActiveProjects (workspaceId: string) {
    return this.get('/workspaces/' + workspaceId + '/projects')
  }

  async getAllProjects (workspaceId: string) {
    return this.get('/workspaces/' + workspaceId + '/projects', { active: 'both' })
  }

  async getProject (projectId: number) {
    return this.get('/projects/' + projectId)
  }

  async getClients () {
    return this.get('/clients')
  }

  async getTasks (projectId?: number) {
    if (projectId === undefined) return []

    var tasks = await this.get('/projects/' + projectId + '/tasks')
    if (tasks === null) tasks = []

    return tasks
  }

  async getTask (taskId?: number) {
    if (taskId === undefined) return undefined
    return this.get('/tasks/' + taskId)
  }

  async get (url: string, queryObject?: any) {
    return this.instance.get(url + '?' + querystring.stringify(queryObject)).then(response => { return this.extractDataIfNeeded(response.data) })
  }

  async post (url: string, data: any) {
    return this.instance.post(url, data).then(response => { return this.extractDataIfNeeded(response.data) })
  }

  private extractDataIfNeeded (payload: any) {
    if (payload === null || payload === undefined) return null
    return (payload.data !== undefined) ? payload.data : payload
  }

  private sleep () {
    return new Promise((resolve) => setTimeout(() => resolve(true), 100))
  }
}
