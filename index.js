require('dotenv').config()
const Toggl = require('./toggl');
const TimeSlotter = require('./timeSlotter')
const FuzzySearch = require('fuzzy-search')

API_TOKEN=process.env.TOGGL_TOKEN
WORKSPACE=process.env.TOGGL_WORKSPACE

const UTCHoursInterval = require('./utcHoursInterval')
const intervals = [new UTCHoursInterval(8, 12), new UTCHoursInterval(13, 17)]

var toggl = new Toggl(API_TOKEN);
var timeSlotter = new TimeSlotter(intervals)
var inquirer = require('inquirer');

inquirer.registerPrompt('ask-for-project', require('inquirer-autocomplete-prompt'));

async function searchProject(projects, keyword) {
  const searcher = new FuzzySearch(projects, ['name'], {caseSensitive: false, sort: true});
  return searcher.search(keyword)
}

async function createTimeEntry(timeEntry, project, description) {
  var timeEntryStop = new Date(timeEntry.stop)
  var now = new Date()

  timeSlotter.slotsIn(timeEntryStop, now).forEach((timeSlot, index) => {
    setTimeout(function timer() {
      toggl.createTimeEntry(project, description, timeSlot)
      .then(_ => {
        console.log("recorded \"" + description + "\" for \"" + project.name + "\" from " + timeSlot.start.toISOString() + " to " + timeSlot.end.toISOString())
      })
      .catch(console.log)
    }, index * 100);
  })
}

async function askForCustomTimeEntry(lastTimeEntry) {
  projects = await toggl.getProjects(WORKSPACE)
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
  lastTimeEntry = await toggl.getLastTimeEntry(WORKSPACE)
  lastTimeEntryProject = await toggl.getProject(lastTimeEntry.pid)
  lastTimeEntryDescription = lastTimeEntry.description

  inquirer.prompt([
    {
      type: 'list',
      name: 'usePreviousEntry',
      message: 'Continue with the previous activity? ("' + lastTimeEntryDescription + '" on project "' + lastTimeEntryProject.name + '")',
      choices: [
        'Yes', 'No',
      ],
    },
  ])
  .then(answers => {
    if (answers.usePreviousEntry == "Yes")
      createTimeEntry(lastTimeEntry, lastTimeEntryProject, lastTimeEntryDescription)
    else
      askForCustomTimeEntry(lastTimeEntry)
  });
}

ask()