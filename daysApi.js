const axios = require('axios').default;
const moment = require('moment')

module.exports = function(apiKey, locale) {
  this.API_KEY = apiKey
  this.locale = locale

  this.workingDaysIn = async function(startDate, endDate) {
    var festiveDays = await this.festiveDaysIn(startDate, endDate)

    return toDateRange(startDate, endDate)
    .filter(it => isWeekDay(it) && isNotFestive(it, festiveDays))
  }

  this.weekendDaysIn = async function(startDate, endDate) {
    return toDateRange(startDate, endDate)
    .filter(it => ! isWeekDay(it))
  }

  this.festiveDaysIn = async function(startDate, endDate) {
    return axios.get('https://www.googleapis.com/calendar/v3/calendars/en.' + this.locale + '%23holiday%40group.v.calendar.google.com/events?key=' + this.API_KEY)
    .then(response => {
      return response.data.items
        .reduce(removeDuplicateFestivities, [])
        .map(toDateRangeExcludingLast)
        .flat()
        .filter(it => it >= startDate && it <= endDate)
    }).catch(_ => {
      console.log("WARNING: Error while retreiving festive days. They wont be skipped.")
      return []
    })
  }

  function toDateRangeExcludingLast(it) {
    startDay = moment(it.start.date)
    endDay = moment(it.end.date).add(-1, 'day')
    return toDateRange(startDay, endDay)
  }

  function toDateRange(startDate, endDate) {
    currentDate = moment(startDate).startOf('day')
    endDate = moment(endDate).startOf('day')

    dateList = []
    while (currentDate <= endDate) {
      dateList.push(moment(currentDate))
      currentDate.add(1, 'day')
    }
    return dateList
  }

  function removeDuplicateFestivities(acc, curr) {
    if(acc.filter(it => it.start.date == curr.start.date).length == 0)
      acc.push(curr)
    return acc
  }

  function isWeekDay(date) {
    return date.weekday() != 0 && date.weekday() != 6
  }

  function isNotFestive(date, festiveDays) {
    return ! festiveDays.some(it => it.diff(date) == 0)
  }
}