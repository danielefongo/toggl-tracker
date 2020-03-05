import axios from 'axios'
import moment, { Moment } from 'moment'

export class DaysApi {
  private workingDays: string[]
  private API_KEY: string
  private locale: string

  constructor (workingDays: string[], apiKey: string, locale: string) {
    this.workingDays = workingDays
    this.API_KEY = apiKey
    this.locale = locale
  }

  async workingDaysIn (start: Moment, end: Moment): Promise<Moment[]> {
    var festiveDays = await this.festiveDaysIn(start, end)

    return toDaysRange(start, end)
      .filter(day => this.isWeekDay(day, this.workingDays) && this.isNotFestive(day, festiveDays))
  }

  async weekendDaysIn (start: Moment, end: Moment): Promise<Moment[]> {
    return toDaysRange(start, end)
      .filter(day => !this.isWeekDay(day, this.workingDays))
  }

  async festiveDaysIn (start: Moment, end: Moment): Promise<Moment[]> {
    return axios.get('https://www.googleapis.com/calendar/v3/calendars/en.' + this.locale + '%23holiday%40group.v.calendar.google.com/events?key=' + this.API_KEY)
      .then(response => {
        return response.data.items
          .reduce(this.removeDuplicateFestivities, [])
          .map(this.toDaysRangeExcludingLast)
          .flat()
          .filter((day: Moment) => day >= start && day <= end)
      }).catch(_ => {
        console.log('WARNING: Error while retreiving festive days. They wont be skipped.')
        return []
      })
  }

  private toDaysRangeExcludingLast (it: any): Moment[] {
    const startDay = moment(it.start.date)
    const endDay = moment(it.end.date).add(-1, 'day')
    return toDaysRange(startDay, endDay)
  }

  private removeDuplicateFestivities (acc: any, curr: any) {
    if (acc.filter((it: any) => it.start.date === curr.start.date).length === 0) {
      acc.push(curr)
    }
    return acc
  }

  private isWeekDay (day: Moment, workingDays: string[]) {
    return workingDays.some(working => working === day.format('dddd'))
  }

  private isNotFestive (day: Moment, festiveDays: Moment[]) {
    return !festiveDays.some(festive => festive.diff(day) === 0)
  }
}

function toDaysRange (start: Moment, end: Moment): Moment[] {
  var currentDay = moment(start).startOf('day')
  const endDay = moment(end).startOf('day')

  const daysList = []
  while (currentDay <= endDay) {
    daysList.push(moment(currentDay.format('YYYY-MM-DD')))
    currentDay = currentDay.add(1, 'day')
  }
  return daysList
}