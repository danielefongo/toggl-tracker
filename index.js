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

async function whatHaveYouDone() {
  answer = await inquirer.prompt([{
    name: 'description',
    message: 'What have you done?',
  }])

  return answer.description
}

async function chooseProject(projects) {
  answer = await inquirer.prompt([{
    type: 'ask-for-project',
    name: 'projectName',
    message: 'Select project name',
    source: function(previousAnser, id) {
      return searchProject(projects, id)
    },
  }])

  return projects.filter(it => it.name == answer.projectName)[0]
}

async function shouldContinueLastActivity(projectName, description) {
  answer = await inquirer.prompt([{
      type: 'list',
      name: 'usePreviousEntry',
      message: 'Continue with the previous activity? ("' + description + '" on project "' + projectName + '")',
      choices: [
        'Yes', 'No',
      ],
    }
  ])
  return answer.usePreviousEntry == "Yes"
}

async function ask() {
  lastTimeEntry = await toggl.getLastTimeEntry(WORKSPACE)
  lastTimeEntryProject = await toggl.getProject(lastTimeEntry.pid)
  lastTimeEntryProjectName = lastTimeEntryProject.name
  lastTimeEntryDescription = lastTimeEntry.description

  continueLastActivity = await shouldContinueLastActivity(lastTimeEntryProjectName, lastTimeEntryDescription)

  if (continueLastActivity == true)
    createTimeEntry(lastTimeEntry, lastTimeEntryProject, lastTimeEntryDescription)
  else {
    projects = await toggl.getProjects(WORKSPACE)
    description = await whatHaveYouDone()
    project = await chooseProject(projects)
    createTimeEntry(lastTimeEntry, project, description)
  }
}

ask()