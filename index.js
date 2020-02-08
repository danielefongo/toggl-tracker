require('dotenv').config()
const TogglClient = require('toggl-api');
const TimeSlotter = require('./timeSlotter')
const FuzzySearch = require('fuzzy-search')

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

const UTCHoursInterval = require('./utcHoursInterval')
const intervals = [new UTCHoursInterval(8, 12), new UTCHoursInterval(13, 17)]

var toggl = new TogglClient({apiToken: API_TOKEN});
var timeSlotter = new TimeSlotter(intervals)
var inquirer = require('inquirer');

inquirer.registerPrompt('ask-for-project', require('inquirer-autocomplete-prompt'));

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

async function getProjects(workspace_id) {
  return new Promise((resolve, reject) => {
    toggl.getWorkspaceProjects(workspace_id, {}, function(err, data) {
      if(err) reject()
      resolve(data)
    });
  })
}

async function getProject(project_id) {
  return new Promise((resolve, reject) => {
    toggl.getProjectData(project_id, function(err, data) {
      if(err) reject()
      resolve(data)
    });
  })
}

async function searchProject(projects, keyword) {
  const searcher = new FuzzySearch(projects, ['name'], {caseSensitive: false, sort: true});
  return searcher.search(keyword)
}

async function createTimeEntry(timeEntry, project, description) {
  var timeEntryStop = new Date(timeEntry.stop)
  timeSlotter.slotsFrom(timeEntryStop).forEach((timeSlot) => {
    toggl.createTimeEntry(
      {
        description: description,
        pid: project.id,
        billable: project.billable,
        duration: timeSlot.duration,
        start: timeSlot.start,
        created_with: "toggl-sheet"
      }, (err) => {
        if(err) console.log(err)
        else {
          console.log("recorded \"" + description + "\" for \"" + project.name + "\" from " + timeSlot.start.toISOString() + " to " + timeSlot.end.toISOString())
        }
      })
  })
}

async function askForCustomTimeEntry(lastTimeEntry) {
  projects = await getProjects(WORKSPACE)
  inquirer.prompt([{
    name: 'description',
    message: 'What have you done?',
  },{
    type: 'ask-for-project',
    name: 'projectName',
    message: 'Select project name',
    source: function(previousAnser, id) {
      return searchProject(projects, id)
    },
  }])
  .then(function(answers) {
    project = projects.filter(it => it.name == answers.projectName)[0]
    description = answers.description
    createTimeEntry(lastTimeEntry, project, description)
  });
}

async function ask() {
  lastTimeEntry = await getLastTimeEntry(WORKSPACE)
  lastTimeEntryProject = await getProject(lastTimeEntry.pid)
  lastTimeEntryDescription = lastTimeEntry.description

  inquirer.prompt([
    {
      type: 'list',
      name: 'usePreviousEntry',
      message: 'Continue with the previous activity? ("' + lastTimeEntryDescription + '" on project "' + lastTimeEntryProject.name + '")',
      choices: [
        'True', 'False',
      ],
    },
  ])
  .then(answers => {
    if (answers.usePreviousEntry == "True")
      createTimeEntry(lastTimeEntry, lastTimeEntryProject, lastTimeEntryDescription)
    else
      askForCustomTimeEntry(lastTimeEntry)
  });
}

ask()