import axios from 'axios'
import moment from 'moment'

export class DaysApi {
  private workingDays
  private API_KEY
  private locale

  constructor (workingDays, apiKey, locale) {
    this.workingDays = workingDays
    this.API_KEY = apiKey
    this.locale = locale
  }

  async workingDaysIn (startMoment, endMoment) {
    var festiveDays = await this.festiveDaysIn(startMoment, endMoment)

    return toDaysRange(startMoment, endMoment)
      .filter(day => this.isWeekDay(day, this.workingDays) && this.isNotFestive(day, festiveDays))
  }

  async weekendDaysIn (startMoment, endMoment) {
    return toDaysRange(startMoment, endMoment)
      .filter(day => !this.isWeekDay(day, this.workingDays))
  }

  async festiveDaysIn (startMoment, endMoment) {
    return axios.get('https://www.googleapis.com/calendar/v3/calendars/en.' + this.locale + '%23holiday%40group.v.calendar.google.com/events?key=' + this.API_KEY)
      .then(response => {
        return response.data.items
          .reduce(this.removeDuplicateFestivities, [])
          .map(this.toDaysRangeExcludingLast)
          .flat()
          .filter(day => day >= startMoment && day <= endMoment)
      }).catch(_ => {
        console.log('WARNING: Error while retreiving festive days. They wont be skipped.')
        return []
      })
  }

  private toDaysRangeExcludingLast (it) {
    const startDay = moment(it.start.date)
    const endDay = moment(it.end.date).add(-1, 'day')
    return toDaysRange(startDay, endDay)
  }

  private removeDuplicateFestivities (acc, curr) {
    if (acc.filter(it => it.start.date === curr.start.date).length === 0) {
      acc.push(curr)
    }
    return acc
  }

  private isWeekDay (day, workingDays) {
    return workingDays.some(working => working === day.format('dddd'))
  }

  private isNotFestive (day, festiveDays) {
    return !festiveDays.some(festive => festive.diff(day) === 0)
  }
}

function toDaysRange (startMoment, endMoment) {
  var currentDay = moment(startMoment).startOf('day')
  const endDay = moment(endMoment).startOf('day')

  const daysList = []
  while (currentDay <= endDay) {
    daysList.push(moment(currentDay.format('YYYY-MM-DD')))
    currentDay = currentDay.add(1, 'day')
  }
  return daysList
}