const axios = require('axios').default;

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
    startDay = new Date(it.start.date)
    endDay = addDaysTo(new Date(it.end.date), -1)
    return toDateRange(startDay, endDay)
  }

  function toDateRange(startDate, endDate) {
    var currentDate = utcDay(startDate);

    dateList = []
    while (utcDay(currentDate) <= utcDay(endDate)) {
      dateList.push(new Date(currentDate))
      currentDate = addDaysTo(currentDate, 1)
    }
    return dateList
  }

  function removeDuplicateFestivities(acc, curr) {
    if(acc.filter(it => it.start.date == curr.start.date).length == 0)
      acc.push(curr)
    return acc
  }

  function isWeekDay(date) {
    var day = date.getDay();
    return day != 0 && day != 6
  }

  function isNotFestive(date, festiveDays) {
    return ! festiveDays.some(it => it.getTime() == date.getTime())
  }

  function utcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  }

  function addDaysTo(date, days) {
    newDate = new Date(date)
    newDate.setUTCDate(newDate.getUTCDate() + days)
    return newDate
  }
}