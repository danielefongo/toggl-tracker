const moment = require('moment')

module.exports = function(daysApi, intervals) {
  this.daysApi = daysApi
  this.intervals = intervals

  this.slotsIn = async function(startTime, endTime) {
    workingDays = await this.daysApi.workingDaysIn(startTime, endTime)
    
    return workingDays
    .map(day => this.intervals.map(interval => timeSlotWithinInterval(startTime, endTime, day, interval)))
    .flat()
    .filter(it => it !== undefined)
  }

  this.slotsInMany = async function(startEnd) {
    promises = startEnd.map(async(it) => await this.slotsIn(it.start, it.end), this)

    return Promise
    .all(promises)
    .then(result => result.flat().filter(it => it.end.diff(it.start) > 0))
  }
    
  function timeSlotWithinInterval(start, end, day, hoursInterval) {
    intervalStartMoment = moment(day).hours(hoursInterval.start)
    intervalEndMoment = moment(day).hours(hoursInterval.end)
    
    if(end <= intervalStartMoment || start >= intervalEndMoment)
      return undefined
    
    startMoment = moment.max(start, intervalStartMoment)
    endMoment = moment.min(end, intervalEndMoment)
    return {
      start: startMoment,
      end: endMoment,
      duration: endMoment.diff(startMoment) / 1000
    }
  }
}