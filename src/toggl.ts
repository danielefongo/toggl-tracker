import moment, { Moment } from 'moment'
import { Printer } from './printer'
import { TimeSlot } from './model/timeSlot'
import { TogglApi } from './togglApi'
import { Project } from './model/project'
import { Task } from './model/task'
import { Entry } from './model/entry'
import { Client } from './model/client'
import { Summary } from './model/summary'
import { ReportsApi } from './reportsApi'

export class Toggl {
  private togglApi: TogglApi
  private reportsApi: ReportsApi
  private workspaceId: string

  constructor (api: TogglApi, reportsApi: ReportsApi, workspaceId: string) {
    this.togglApi = api
    this.reportsApi = reportsApi
    this.workspaceId = workspaceId
  }

  async createTimeEntries (project: Project, task: Task, description: string, timeSlots: TimeSlot[]) {
    const self = this
    timeSlots.forEach((timeSlot, index) => {
      setTimeout(function timer () {
        self.createTimeEntry(project, task, description, timeSlot)
          .catch(console.log)
      }, index * 100)
    })
  }

  async createTimeEntry (project: Project, task: Task, description: string, timeSlot: TimeSlot) {
    return this.togglApi.createTimeEntry({
      description: description,
      pid: project.id,
      tid: task.id,
      billable: project.billable,
      duration: timeSlot.duration,
      start: timeSlot.start.toDate(),
      stop: timeSlot.end.toDate(),
      created_with: 'toggl-tracker'
    }).then(entry => {
      Printer.entry(project, timeSlot)
      return entry
    })
  }

  async getTimeEntries (from: Moment, to: Moment): Promise<Entry[]> {
    const entries = await this.togglApi.getTimeEntries(this.workspaceId, from.format(), to.format())
    return entries
      .filter((it: any) => it.wid.toString() === this.workspaceId)
      .map(this.convertToEntry)
  }

  async getLastTimeEntry (from: Moment, to: Moment): Promise<Entry> {
    const timeEntries = await this.getTimeEntries(from, to)
    return timeEntries.pop()!!
  }

  async getTimeEntriesHoles (from: Moment, to: Moment): Promise<TimeSlot[]> {
    var entries = await this.getTimeEntries(from, to)

    entries.unshift(new Entry(moment(), from))
    entries.push(new Entry(to, moment()))

    return entries
      .slice(1)
      .map((_, idx) => new TimeSlot(entries[idx].slot.end, entries[idx + 1].slot.start))
      .filter(it => it.end.diff(it.start) > 0)
  }

  async getActiveProjects (): Promise<Project[]> {
    const togglProjects = await this.togglApi.getActiveProjects(this.workspaceId)
    const projects = togglProjects.map(this.convertToProject)
    projects.unshift(new Project())
    return projects
  }

  async getAllProjects (): Promise<Project[]> {
    const togglProjects = await this.togglApi.getAllProjects(this.workspaceId)
    const projects = togglProjects.map(this.convertToProject)
    projects.unshift(new Project())
    return projects
  }

  async getClients (): Promise<Client[]> {
    const togglClients = await this.togglApi.getClients()
    const clients = togglClients.map(this.convertToClient)
    clients.push(new Client())
    return clients
  }

  async getProject (projectId?: number): Promise<Project> {
    if (projectId === undefined) return new Project()
    const project = await this.togglApi.getProject(projectId)
    return this.convertToProject(project)
  }

  async getTasks (projectId?: number): Promise<Task[]> {
    const togglTasks = await this.togglApi.getTasks(projectId)
    const tasks = togglTasks.map(this.convertToTask)
    tasks.push(new Task())
    return tasks
  }

  async getTask (taskId?: number): Promise<Task> {
    if (taskId === undefined) return new Task()
    const task = await this.togglApi.getTask(taskId)
    return task !== undefined ? task : new Task()
  }

  async getSummary (start: Moment, end: Moment): Promise<Summary[]> {
    const togglSummary = await this.reportsApi.getSummary(this.workspaceId, start.format(), end.format())
    return togglSummary.map(this.convertToSummary)
  }

  private convertToProject (project: any): Project {
    return new Project(project.name, project.id, project.billable, project.cid)
  }

  private convertToTask (task: any): Task {
    return new Task(task.name, task.id)
  }

  private convertToClient (task: any): Client {
    return new Client(task.name, task.id)
  }

  private convertToEntry (entry: any): Entry {
    return new Entry(moment(entry.start), moment(entry.stop), entry.description, entry.id, entry.pid)
  }

  private convertToSummary (summary: any): Summary {
    const client = new Client(summary.title.client)
    const project = new Project(summary.title.project)
    return new Summary(client, project, summary.time / 1000)
  }
}