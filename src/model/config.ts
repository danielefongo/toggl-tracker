import { IntervalsParser } from '../intervalsParser'

export class Config {
  workingDays: string[]
  workingHoursIntervals: string
  lookForwardDays: number
  lookBehindDays: number
  togglToken: string
  togglWorkspace: string
  googleToken: string
  googleLocale: string

  constructor (json: any) {
    this.workingDays = json.workingDays
    this.workingHoursIntervals = json.workingHoursIntervals
    this.lookForwardDays = json.lookForwardDays
    this.lookBehindDays = json.lookBehindDays
    this.togglToken = json.togglToken
    this.togglWorkspace = json.togglWorkspace
    this.googleToken = json.googleToken
    this.googleLocale = json.googleLocale
  }

  isValid() {
    return Config.validateWorkingDays(this.workingDays) &&
      Config.validateWorkingHoursIntervals(this.workingHoursIntervals) &&
      Config.validateDaysNumber(this.lookForwardDays) &&
      Config.validateDaysNumber(this.lookBehindDays) &&
      Config.validateTogglToken(this.togglToken) &&
      Config.validateTogglWorkspace(this.togglWorkspace)
  }

  static validateWorkingDays (workingDays: string[]) {
    if (workingDays === undefined) return false
    const validDays = workingDays.filter(it => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(it))
    return validDays.length == workingDays.length
  }

  static validateWorkingHoursIntervals (intervalString: string) {
    if (intervalString === undefined) return false
    const intervals = (new IntervalsParser()).parse(intervalString)
    return intervals.length > 0
  }

  static validateDaysNumber (days: any) {
    if (typeof days === 'string')
      days = Number(days)
    return Math.round(days) === days && days > 0
  }

  static validateTogglToken (token: string) {
    if (token === undefined) return false
    return token && token.replace(/ /g, '').length > 0
  }

  static validateTogglWorkspace (workspace) {
    if (workspace === undefined) return false
    return workspace && workspace.replace(/ /g, '').length > 0
  }
}