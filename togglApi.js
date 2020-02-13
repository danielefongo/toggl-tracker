const TogglClient = require('toggl-api');

module.exports = function(token) {
  this.toggl = new TogglClient({apiToken: token});

  this.createTimeEntries = async function(project, description, timeSlots) {
    self = this
    timeSlots.forEach((timeSlot, index) => {
      setTimeout(function timer() {
        self.createSingleTimeEntry(project, description, timeSlot)
        .then(_ => console.log("recorded \"" + description + "\" for \"" + project.name + "\" from " + timeSlot.start.format('MMM DD HH:mm') + " to " + timeSlot.end.format('MMM DD HH:mm')))
        .catch(console.log)
      }, index * 100);
    })
  }

  this.createSingleTimeEntry = async function(project, description, timeSlot) {
    return new Promise((resolve, reject) => {
      this.toggl.createTimeEntry({
        description: description,
        pid: project.id,
        billable: project.billable,
        duration: timeSlot.duration,
        start: timeSlot.start.toDate(),
        created_with: "toggl-sheet"
      }, (err) => {
        if(err)
          reject(err)
        resolve()
      })
    })
  }

  this.getTimeEntries = async function(workspace_id, fromMoment, toMoment) {
    return new Promise((resolve, reject) => {
      this.toggl.getTimeEntries(date(fromMoment), date(toMoment), function(err, data) {
        if(err) reject()
        resolve(data.filter(element => element.wid == workspace_id));
      })
    })
  }

  this.getLastTimeEntry = async function(workspace_id, fromMoment, toMoment) {
    timeEntries = await this.getTimeEntries(workspace_id, fromMoment, toMoment)
    return timeEntries.pop()
  }

  this.getProjects = async function(workspace_id) {
    return new Promise((resolve, reject) => {
      this.toggl.getWorkspaceProjects(workspace_id, {}, function(err, data) {
        if(err) reject()
        resolve(data)
      });
    })
  }

  this.getProject = async function(project_id) {
    return new Promise((resolve, reject) => {
      this.toggl.getProjectData(project_id, function(err, data) {
        if(err) reject()
        resolve(data)
      });
    })
  }

  function date(moment) {
    return moment.toDate()
  }
}