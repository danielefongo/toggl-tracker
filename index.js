require('dotenv').config()
const UTCHoursInterval = require('./utcHoursInterval')
const intervals = [new UTCHoursInterval(8, 12), new UTCHoursInterval(13, 17)]

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

var TogglClient = require('toggl-api');
var toggl = new TogglClient({apiToken: API_TOKEN});

async function getLastTimeEntry(workspace_id) {
  return new Promise((resolve, reject) => {
    toggl.getTimeEntries(function(err, data) {
      if(err) reject()
      resolve(data
        .filter(element => element.wid == workspace_id)
        .pop()
      );
    })
  })
}

function createTimeEntryByCopying(timeEntry) {
  var timeEntryStop = new Date(timeEntry.stop)
  timeSlotsFrom(timeEntryStop, intervals).forEach((timeSlot) => {
    toggl.createTimeEntry(
      {
        description: timeEntry.description,
        duration: timeSlot.duration,
        start: timeSlot.start,
        pid: timeEntry.pid,
        created_with: "toggl-sheet"
      }, (err) => {
        if(err) console.log(err)
        else {
          console.log("recorded \"" + timeEntry.description + "\" from " + timeSlot.start.toISOString() + " to " + timeSlot.end.toISOString())
        }
      })
  })
}

getLastTimeEntry(WORKSPACE).then(createTimeEntryByCopying)


// UTILS
function timeSlotsFrom(start_time, intervals) {
  end_time = new Date()

  a = toDateRange(start_time, end_time).map(date => {
    return intervals.map(interval => {
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
