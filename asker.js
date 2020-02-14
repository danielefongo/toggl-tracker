const FuzzySearch = require('fuzzy-search')

var inquirer = require('inquirer')
inquirer.registerPrompt('ask-for-project', require('inquirer-autocomplete-prompt'))

module.exports = function () {
  this.whatHaveYouDone = async function () {
    const answer = await inquirer.prompt([{
      name: 'description',
      message: 'What have you done?'
    }])

    return answer.description
  }

  this.chooseProject = async function (projects, clients) {
    const choices = projectsToChoices(projects, clients)
    const answer = await inquirer.prompt([{
      type: 'ask-for-project',
      name: 'project',
      message: 'Select project name',
      source: (_, id) => searchProject(choices, id)
    }])

    return projects.filter(it => it.id === answer.project.id)[0]
  }

  this.pickIntervals = async function (intervals) {
    const choices = intervalsToChoices(intervals)
    const answer = await inquirer.prompt([{
      type: 'checkbox',
      name: 'interval',
      message: 'Pick interval(s)',
      choices: choices
    }])

    return answer.interval
  }

  this.shouldContinueLastActivity = async function (projectName, description) {
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'usePreviousEntry',
      message: 'Continue with the previous activity? ("' + description + '" on project "' + projectName + '")',
      choices: ['Yes', 'No']
    }])
    return answer.usePreviousEntry === 'Yes'
  }

  async function searchProject (projects, keyword) {
    const searcher = new FuzzySearch(projects, ['name'], { caseSensitive: false, sort: true })
    return searcher.search(keyword)
  }

  function intervalsToChoices (intervals) {
    return intervals.map(it => {
      return {
        name: it.start.format('MMM DD') + ': ' + it.start.format('HH:mm') + ' -> ' + it.end.format('HH:mm'),
        value: it
      }
    })
  }

  function projectsToChoices (projects, clients) {
    return projects.map(project => {
      const client = clients.filter(client => client.id === project.cid)[0]
      const clientTag = client ? '[' + client.name + '] ' : ''

      return {
        name: clientTag + project.name,
        value: project
      }
    })
  }
}
