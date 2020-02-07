module.exports = function(intervals) {
    this.intervals = intervals

    this.slotsFrom = function(start_time) {
        end_time = new Date()
      
        a = toDateRange(start_time, end_time).map(date => {
          return this.intervals.map(interval => {
            slot = timeSlotWithinInterval(start_time, end_time, date, interval)
            return {
              start: slot.start,
              end: slot.end,
              duration: slot.duration
            }
          })
        })
      
        return a.flat().filter(it => it.start !== undefined)
    }
      
    function timeSlotWithinInterval(start, end, day, utcHoursInterval) {
        seconds = secondsBetween(start, end)
        
        interval_start = utcDayWithCustomHour(day, utcHoursInterval.start)
        interval_end = utcDayWithCustomHour(day, utcHoursInterval.end)
        
        if(end <= interval_start || start >= interval_end)
          return 0
        if(start < interval_start) {
          seconds -= secondsBetween(start, interval_start)
          start = interval_start
        }
        if(end > interval_end) {
          seconds -= secondsBetween(interval_end, end)
          end = interval_end
        }
        return {
          start: start,
          end: end,
          duration: seconds
        }
    }
      
    function toDateRange(startDate, endDate) {
        var currentDate = utcDay(startDate);
      
        dateList = []
        while (utcDay(currentDate) <= utcDay(endDate)) {
          dateList.push(new Date(currentDate))
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        return dateList
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