const moment = require('moment')

module.exports = function(daysApi, intervals) {
  this.daysApi = daysApi
  this.intervals = intervals

  this.slotsIn = async function(start_time, end_time) {
    workingDays = await this.daysApi.workingDaysIn(start_time, end_time)
    
    return workingDays
    .map(date => this.intervals.map(interval => timeSlotWithinInterval(start_time, end_time, date, interval)))
    .flat()
    .filter(it => it !== undefined)
  }
    
  function timeSlotWithinInterval(start, end, day, hoursInterval) {
    interval_start = moment(day).hours(hoursInterval.start)
    interval_end = moment(day).hours(hoursInterval.end)
    
    if(end <= interval_start || start >= interval_end)
      return undefined
    
    start = moment.max(start, interval_start)
    end = moment.min(end, interval_end)
    return {
      start: start,
      end: end,
      duration: end.diff(start) / 1000
    }
  }
}