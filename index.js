require('dotenv').config()

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

var TogglClient = require('toggl-api');
var toggl = new TogglClient({apiToken: API_TOKEN});

function timeSlotsFrom(timeString) {
  start_time = new Date(timeString)
  durationInSeconds = Math.floor((new Date() - new Date(timeString)) / 1000)
  return [{
    start: start_time,
    duration: durationInSeconds
  }]
}

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
  timeSlotsFrom(timeEntry.stop).forEach((timeSlot) => {
    toggl.createTimeEntry(
      {
        description: timeEntry.description,
        duration: timeSlot.duration,
        start: timeSlot.start,
        pid: timeEntry.pid,
        created_with: "toggl-sheet"
      }, (err) => {
        if(err) console.log(err)
      })
  })
}

getLastTimeEntry(WORKSPACE).then(createTimeEntryByCopying)
