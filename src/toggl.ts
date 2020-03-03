import moment from 'moment'
import { Printer } from './printer'

export class Toggl {
  private api

  constructor (togglApi) {
    this.api = togglApi
  }

  async createTimeEntries (project, task, description, timeSlots) {
    const self = this
    timeSlots.forEach((timeSlot, index) => {
      setTimeout(function timer () {
        self.createTimeEntry(project, task, description, timeSlot)
          .catch(console.log)
      }, index * 100)
    })
  }

  async createTimeEntry (project, task, description, timeSlot) {
    return this.api.createTimeEntry({
      description: description,
      pid: project.id,
      tid: task.id,
      billable: project.billable,
      duration: timeSlot.duration,
      start: this.date(timeSlot.start),
      stop: this.date(timeSlot.end),
      created_with: 'toggl-tracker'
    }).then(entry => {
      Printer.entry(project, timeSlot.start, timeSlot.end)
      return entry
    })
  }

  async getTimeEntries (workspaceId, fromMoment, toMoment) {
    const entries = await this.api.getTimeEntries(workspaceId, fromMoment.format(), toMoment.format())
    return entries
      .filter(element => element.wid.toString() === workspaceId)
      .map(this.useMoment)
  }

  async getLastTimeEntry (workspaceId, fromMoment, toMoment) {
    const timeEntries = await this.getTimeEntries(workspaceId, fromMoment, toMoment)
    return timeEntries.pop()
  }

  async getTimeEntriesHoles (workspaceId, fromMoment, toMoment) {
    var entries = await this.getTimeEntries(workspaceId, fromMoment, toMoment)

    entries.unshift({ stop: fromMoment })
    entries.push({ start: toMoment })

    return entries
      .slice(1)
      .map((_, idx) => {
        return {
          start: entries[idx].stop,
          end: entries[idx + 1].start
        }
      })
      .filter(it => it.end.diff(it.start) > 0)
  }

  async getActiveProjects (workspaceId) {
    const projects = await this.api.getActiveProjects(workspaceId)
    projects.unshift(this.emptyProject())
    return projects
  }

  async getAllProjects (workspaceId) {
    const projects = await this.api.getAllProjects(workspaceId)
    projects.unshift(this.emptyProject())
    return projects
  }

  async getClients () {
    return this.api.getClients()
  }

  async getProject (projectId) {
    return this.api.getProject(projectId)
  }

  async getTasks (projectId) {
    const tasks = await this.api.getTasks(projectId)
    tasks.push(this.emptyTask())
    return tasks
  }

  async getTask (taskId) {
    const task = await this.api.getTask(taskId)
    return task !== undefined ? task : this.emptyTask()
  }

  private date (moment) {
    return moment.toDate()
  }

  private useMoment (it) {
    it.start = moment(it.start)
    it.stop = moment(it.stop)
    return it
  }

  private emptyTask () {
    return { id: undefined, name: '[no task]' }
  }

  private emptyProject () {
    return { id: undefined, name: 'NO PROJECT' }
  }
}