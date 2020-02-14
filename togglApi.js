const TogglClient = require('toggl-api');
const moment = require('moment')

module.exports = function(token) {
  this.toggl = new TogglClient({apiToken: token});

  this.createTimeEntries = async function(project, description, timeSlots) {
    self = this
    timeSlots.forEach((timeSlot, index) => {
      setTimeout(function timer() {
        self.createSingleTimeEntry(project, description, timeSlot)
        .then(_ => console.log("recorded \"" + description + "\" on project \"" + project.name + "\" for " + timeSlot.start.format('MMM DD') + ", from " + timeSlot.start.format('HH:mm') + " to " + timeSlot.end.format('HH:mm')))
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
        start: date(timeSlot.start),
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
        resolve(data
          .filter(element => element.wid == workspace_id)
          .map(useMoment)
        );
      })
    })
  }

  this.getTimeEntriesHoles = async function(workspace_id, fromMoment, toMoment) {
    entries = await this.getTimeEntries(workspace_id, fromMoment, toMoment)
    
    entries.unshift({stop: fromMoment})
    entries.push({start: toMoment})

    return entries
    .slice(1)
    .map((_, idx) => {
      return {
        start: entries[idx].stop,
        end: entries[idx+1].start
      }
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

  this.getClients = async function() {
    return new Promise((resolve, reject) => {
      this.toggl.getClients(function(err, data) {
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

  function useMoment(it) {
    it.start = moment(it.start)
    it.stop = moment(it.stop)
    return it
  }
}