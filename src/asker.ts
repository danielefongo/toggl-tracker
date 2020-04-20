import fuzzysort from 'fuzzysort'
import inquirer from 'inquirer'
import { Project } from './model/project'
import { Task } from './model/task'
import { TimeSlot } from './model/timeSlot'
import { Client } from './model/client'
import { Config } from './model/config'

inquirer.registerPrompt('autocomplete-list', require('inquirer-autocomplete-prompt'))

export class Asker {
  async inquire (question, type?, choices?) {
    const answer = await inquirer.prompt([{
      type: type,
      name: 'data',
      message: question,
      choices: choices
    }])

    return answer.data
  }

  async autocompleteInquire (question, choices) {
    const answer = await inquirer.prompt([{
      type: 'autocomplete-list',
      name: 'data',
      message: question,
      choices: choices,
      source: (_: any, id: string) => this.search(choices, id)
    }])

    return answer.data
  }

  async init (config: Config) {
    config = await inquirer.prompt([{
      type: 'checkbox',
      name: 'workingDays',
      message: 'Pick working days',
      default: config.workingDays,
      choices: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }, {
      type: 'input',
      name: 'workingHoursIntervals',
      message: 'Select working hours intervals',
      default: config.workingHoursIntervals,
      validate: this.validate(Config.validateWorkingHoursIntervals)
    }, {
      type: 'input',
      name: 'lookForwardDays',
      message: 'Select number of forward days',
      default: config.lookForwardDays,
      validate: this.validate(Config.validateDaysNumber)
    }, {
      type: 'input',
      name: 'lookBehindDays',
      message: 'Select number of behind days',
      default: config.lookBehindDays,
      validate: this.validate(Config.validateDaysNumber)
    }, {
      name: 'togglToken',
      message: 'Insert toggl token',
      default: config.togglToken,
      validate: this.validate(Config.validateTogglToken)
    }, {
      name: 'togglWorkspace',
      message: 'Insert toggl workspace',
      default: config.togglWorkspace,
      validate: this.validate(Config.validateTogglWorkspace)
    }, {
      name: 'googleToken',
      message: 'Insert google token (optional)',
      default: config.googleToken
    }, {
      name: 'googleLocale',
      message: 'Insert google locale (optional)',
      default: config.googleLocale
    }])

    return config
  }

  async chooseProject (projects: Project[], clients: Client[]): Promise<Project> {
    const choices = this.projectsToChoices(projects, clients)
    const answer = await inquirer.prompt([{
      type: 'autocomplete-list',
      name: 'project',
      message: 'Select project name',
      source: (_: any, id: string) => this.search(choices, id)
    }])

    return projects.filter(it => it.id === answer.project.id)[0]
  }

  async chooseTask (tasks: Task[]) {
    const choices = this.tasksToChoices(tasks)
    const answer = await inquirer.prompt([{
      type: 'autocomplete-list',
      name: 'task',
      message: 'Select task name',
      source: (_: any, id: any) => this.search(choices, id)
    }])

    return tasks.filter(it => it.id === answer.task.id)[0]
  }

  async chooseGranularity () {
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'granularity',
      message: 'Select granularity',
      choices: ['day', 'week', 'month', 'year']
    }])

    return answer.granularity
  }

  async pickSlots (intervals: TimeSlot[]) {
    const choices = this.slotsToChoices(intervals)
    const answer = await inquirer.prompt([{
      type: 'checkbox',
      name: 'interval',
      message: 'Pick interval(s)',
      choices: choices,
      validate: (answer: any) => {
        if (answer.length === 0) return 'Pick at least 1 interval'
        return true
      }
    }])

    return answer.interval
  }

  private async search (projects: any, keyword: string) {
    if (keyword === undefined || keyword === '') return projects
    return fuzzysort.go(keyword, projects, { key: 'name' }).map(it => it.obj)
  }

  private slotsToChoices (slots: TimeSlot[]) {
    return slots.map(it => {
      return {
        name: it.description,
        value: it
      }
    })
  }

  private projectsToChoices (projects: Project[], clients: Client[]) {
    return projects.map(project => {
      const client = clients.filter(client => client.id === project.cid)[0]

      return {
        name: client.description + ' ' + project.description,
        value: project
      }
    })
  }

  private tasksToChoices (tasks: Task[]) {
    return tasks.map(task => {
      return {
        name: task.description,
        value: task
      }
    })
  }

  private validate (validator: (data) => boolean) {
    return function (data) {
      if (!validator(data)) return 'Invalid input'
      return true
    }
  }
}