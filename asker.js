const FuzzySearch = require('fuzzy-search')

var inquirer = require('inquirer');
inquirer.registerPrompt('ask-for-project', require('inquirer-autocomplete-prompt'));

module.exports = function() {
  this.whatHaveYouDone = async function() {
    answer = await inquirer.prompt([{
      name: 'description',
      message: 'What have you done?',
    }])
  
    return answer.description
  }
    
  this.chooseProject = async function(projects) {
    answer = await inquirer.prompt([{
      type: 'ask-for-project',
      name: 'projectName',
      message: 'Select project name',
      source: (previousAnser, id) => searchProject(projects, id)
    }])
    
    return projects.filter(it => it.name == answer.projectName)[0]
  }
    
  this.shouldContinueLastActivity = async function(projectName, description) {
    answer = await inquirer.prompt([{
      type: 'list',
      name: 'usePreviousEntry',
      message: 'Continue with the previous activity? ("' + description + '" on project "' + projectName + '")',
      choices: ['Yes', 'No'],
    }])
    return answer.usePreviousEntry == "Yes"
  }

  async function searchProject(projects, keyword) {
    const searcher = new FuzzySearch(projects, ['name'], {caseSensitive: false, sort: true});
    return searcher.search(keyword)
  }
}