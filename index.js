require('dotenv').config()

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

getLastTimeEntry(WORKSPACE).then(console.log)