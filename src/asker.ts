import fuzzysort from 'fuzzysort'
import inquirer from 'inquirer'
import { Project } from './model/project'
import { Task } from './model/task'
import { Interval } from './model/interval'
import { TimeSlot } from './model/timeSlot'
import { Client } from './model/client'

inquirer.registerPrompt('autocomplete-list', require('inquirer-autocomplete-prompt'))

export class Asker {
  async whatHaveYouDone () {
    const answer = await inquirer.prompt([{
      name: 'description',
      message: 'What have you done?'
    }])

    return answer.description
  }

  async init (config) {
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
      default: config.workingHoursIntervals
    }, {
      type: 'number',
      name: 'lookForwardDays',
      message: 'Select number of forward days',
      default: config.lookForwardDays
    }, {
      type: 'input',
      name: 'lookBehindDays',
      message: 'Select number of behind days',
      default: config.lookBehindDays
    }, {
      name: 'togglToken',
      message: 'Insert toggl token',
      default: config.togglToken
    }, {
      name: 'togglWorkspace',
      message: 'Insert toggl workspace',
      default: config.togglWorkspace
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

  async shouldContinueLastActivity (projectName: string, description: string) {
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'usePreviousEntry',
      message: 'Continue with the previous activity? ("' + description + '" on project "' + projectName + '")',
      choices: ['Yes', 'No']
    }])
    return answer.usePreviousEntry === 'Yes'
  }

  private async search (projects: any, keyword: string) {
    if (keyword === undefined || keyword === '') return projects
    return fuzzysort.go(keyword, projects, { key: 'name' }).map(it => it.obj)
  }

  private slotsToChoices (slots: TimeSlot[]) {
    return slots.map(it => {
      return {
        name: it.start.format('MMM DD') + ': ' + it.start.format('HH:mm') + ' -> ' + it.end.format('HH:mm'),
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
}