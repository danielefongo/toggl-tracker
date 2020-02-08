module.exports = function(intervals) {
    this.intervals = intervals

    this.slotsIn = function(start_time, end_time) {
        slots = toDateRange(start_time, end_time).map(date => {
          return this.intervals.map(interval => {
            return timeSlotWithinInterval(start_time, end_time, date, interval)
          })
        })
        return slots.flat().filter(it => it !== undefined)
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
      
    function toDateRange(startDate, endDate) {
        var currentDate = utcDay(startDate);
      
        dateList = []
        while (utcDay(currentDate) <= utcDay(endDate)) {
          if(isWorkingDay(currentDate))
            dateList.push(new Date(currentDate))
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        return dateList
    }
    
    function isWorkingDay(date) {
        var day = date.getDay();
        return day != 0 && day != 6
    }
    
    function utcDay(date) {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    }
    
    function utcDayWithCustomHour(date, hours) {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, 0))
    }
    
    function secondsBetween(start, end) {
        return Math.round((end - start) / 1000)
    }
}