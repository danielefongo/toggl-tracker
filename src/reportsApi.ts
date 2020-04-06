import axios, {AxiosInstance} from 'axios'
import querystring from 'querystring'

export class ReportsApi {
  private instance: AxiosInstance

  constructor (token: string) {
    this.instance = axios.create({
      baseURL: 'https://www.toggl.com/reports/api/v2/',
      auth: { username: token, password: 'api_token' },
      headers: { 'Content-type': 'application/json' }
    })
  }

  async getSummary (workspaceId: string, startDateString: string, endDateString) {
    return this.get('/summary', {
      workspace_id: workspaceId,
      since: startDateString,
      until: endDateString,
      user_agent: 'toggl-tracker'
    })
  }

  async get (url: string, queryObject?: any) {
    return this.instance.get(url + '?' + querystring.stringify(queryObject)).then(response => { return this.extractDataIfNeeded(response.data) })
  }

  private extractDataIfNeeded (payload: any) {
    if (payload === null || payload === undefined) return null
    return (payload.data !== undefined) ? payload.data : payload
  }
}