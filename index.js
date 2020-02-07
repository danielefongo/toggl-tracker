require('dotenv').config()
const TogglClient = require('toggl-api');
const TimeSlotter = require('./timeSlotter')

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

const UTCHoursInterval = require('./utcHoursInterval')
const intervals = [new UTCHoursInterval(8, 12), new UTCHoursInterval(13, 17)]

var toggl = new TogglClient({apiToken: API_TOKEN});
var timeSlotter = new TimeSlotter(intervals)
var args = process.argv.slice(2);

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

function createTimeEntryByCopying(timeEntry, projectId, description) {
  if(description === undefined && projectId == undefined) {
    description = timeEntry.description
    projectId = timeEntry.pid
  }

  var timeEntryStop = new Date(timeEntry.stop)
  timeSlotter.slotsFrom(timeEntryStop).forEach((timeSlot) => {
    toggl.createTimeEntry(
      {
        description: description,
        pid: projectId,
        duration: timeSlot.duration,
        start: timeSlot.start,
        created_with: "toggl-sheet"
      }, (err) => {
        if(err) console.log(err)
        else {
          console.log("recorded \"" + description + "\" from " + timeSlot.start.toISOString() + " to " + timeSlot.end.toISOString())
        }
      })
  })
}


getLastTimeEntry(WORKSPACE).then((timeEntry) => createTimeEntryByCopying(timeEntry, args[0], args[1]))