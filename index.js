require('dotenv').config()

API_TOKEN=process.env.TOGGL_TOKEN

var TogglClient = require('toggl-api');
var toggl = new TogglClient({apiToken: API_TOKEN});

toggl.getUserData({}, function(err, data) {
  console.log(data)
  toggl.destroy()
});
