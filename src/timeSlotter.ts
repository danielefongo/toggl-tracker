import moment from 'moment'

export class TimeSlotter {
  private daysApi
  private intervals

  constructor (daysApi, intervals) {
    this.daysApi = daysApi
    this.intervals = intervals
  }

  async slotsIn (startTime, endTime) {
    const workingDays = await this.daysApi.workingDaysIn(startTime, endTime)

    return this.slots(startTime, endTime, workingDays, this.intervals)
  }

  async slotsInMany (startEnd) {
    const globalStart = moment.min(startEnd.map(it => it.start))
    const globalEnd = moment.max(startEnd.map(it => it.end))

    const workingDays = await this.daysApi.workingDaysIn(globalStart, globalEnd)

    return startEnd
      .map(it => this.slots(it.start, it.end, workingDays, this.intervals))
      .flat()
  }

  private slots (startTime, endTime, workingDays, intervals) {
    return workingDays
      .map(day => intervals.map(interval => this.slotWithinInterval(startTime, endTime, day, interval)))
      .flat()
      .filter(it => it.duration > 0)
  }

  private slotWithinInterval (start, end, day, hoursInterval) {
    const intervalStartMoment = moment(day).hours(hoursInterval.start.hours).minutes(hoursInterval.start.minutes)
    const intervalEndMoment = moment(day).hours(hoursInterval.end.hours).minutes(hoursInterval.end.minutes)

    const startMoment = moment.max(start, intervalStartMoment)
    const endMoment = moment.min(end, intervalEndMoment)
    return {
      start: startMoment,
      end: endMoment,
      duration: endMoment.diff(startMoment) / 1000
    }
  }
}