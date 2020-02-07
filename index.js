require('dotenv').config()

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

var TogglClient = require('toggl-api');
var toggl = new TogglClient({apiToken: API_TOKEN});

function secondsFrom(timeString) {
  return Math.floor((new Date() - new Date(timeString)) / 1000)
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
  toggl.createTimeEntry(
  {
    description: timeEntry.description,
    duration: secondsFrom(timeEntry.stop),
    start: timeEntry.stop,
    pid: timeEntry.pid,
    created_with: "toggl-sheet"
  }, (err) => {
    if(err) console.log(err)
  })
}

getLastTimeEntry(WORKSPACE).then(createTimeEntryByCopying)
