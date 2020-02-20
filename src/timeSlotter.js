const moment = require('moment')

module.exports = function (daysApi, intervals) {
  this.daysApi = daysApi
  this.intervals = intervals

  this.slotsIn = async function (startTime, endTime) {
    const workingDays = await this.daysApi.workingDaysIn(startTime, endTime)

    return slots(startTime, endTime, workingDays, this.intervals)
  }

  this.slotsInMany = async function (startEnd) {
    const globalStart = moment.min(startEnd.map(it => it.start))
    const globalEnd = moment.max(startEnd.map(it => it.end))

    const workingDays = await this.daysApi.workingDaysIn(globalStart, globalEnd)

    return startEnd
      .map(it => slots(it.start, it.end, workingDays, this.intervals))
      .flat()
  }

  function slots (startTime, endTime, workingDays, intervals) {
    return workingDays
      .map(day => intervals.map(interval => slotWithinInterval(startTime, endTime, day, interval)))
      .flat()
      .filter(it => it.duration > 0)
  }

  function slotWithinInterval (start, end, day, hoursInterval) {
    const intervalStartMoment = moment(day).hours(hoursInterval.start)
    const intervalEndMoment = moment(day).hours(hoursInterval.end)

    const startMoment = moment.max(start, intervalStartMoment)
    const endMoment = moment.min(end, intervalEndMoment)
    return {
      start: startMoment,
      end: endMoment,
      duration: endMoment.diff(startMoment) / 1000
    }
  }
}

Array.prototype.flat = function () {
  return [].concat(...this)
}
