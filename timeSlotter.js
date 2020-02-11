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
    
  function timeSlotWithinInterval(start, end, day, utcHoursInterval) {
    interval_start = utcDayWithCustomHour(day, utcHoursInterval.start)
    interval_end = utcDayWithCustomHour(day, utcHoursInterval.end)
    
    if(end <= interval_start || start >= interval_end)
      return undefined
    
    start = new Date(Math.max(start, interval_start))
    end = new Date(Math.min(end, interval_end))
    return {
      start: start,
      end: end,
      duration: secondsBetween(start, end)
    }
  }

  function utcDayWithCustomHour(date, hour) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour))
  }
  
  function secondsBetween(start, end) {
    return Math.round((end - start) / 1000)
  }
}