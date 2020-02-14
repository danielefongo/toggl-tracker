const moment = require('moment')

module.exports = function (daysApi, intervals) {
  this.daysApi = daysApi
  this.intervals = intervals

  this.slotsIn = async function (startTime, endTime) {
    workingDays = await this.daysApi.workingDaysIn(startTime, endTime)

    return slots(startTime, endTime, workingDays, this.intervals)
  }

  this.slotsInMany = async function (startEnd) {
    globalStart = moment.min(startEnd.map(it => it.start))
    globalEnd = moment.max(startEnd.map(it => it.end))

    workingDays = await this.daysApi.workingDaysIn(globalStart, globalEnd)

    return startEnd
      .map(it => slots(it.start, it.end, workingDays, this.intervals))
      .flat()
      .filter(it => it.end.diff(it.start) > 0)
  }

  function slots (startTime, endTime, workingDays, intervals) {
    return workingDays
      .map(day => intervals.map(interval => slotWithinInterval(startTime, endTime, day, interval)))
      .flat()
      .filter(it => it !== undefined)
  }

  function slotWithinInterval (start, end, day, hoursInterval) {
    intervalStartMoment = moment(day).hours(hoursInterval.start)
    intervalEndMoment = moment(day).hours(hoursInterval.end)

    if (end <= intervalStartMoment || start >= intervalEndMoment) { return undefined }

    startMoment = moment.max(start, intervalStartMoment)
    endMoment = moment.min(end, intervalEndMoment)
    return {
      start: startMoment,
      end: endMoment,
      duration: endMoment.diff(startMoment) / 1000
    }
  }
}
