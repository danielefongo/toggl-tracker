import moment, { Moment } from 'moment'
import { Printer } from './printer'
import { TimeSlot } from './model/timeSlot'
import { TogglApi } from './togglApi'
import { Project } from './model/project'
import { Task } from './model/task'
import { Entry } from './model/entry'
import { Client } from './model/client'

export class Toggl {
  private api: TogglApi

  constructor (api: TogglApi) {
    this.api = api
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
    return this.api.createTimeEntry({
      description: description,
      pid: project.id,
      tid: task.id,
      billable: project.billable,
      duration: timeSlot.duration,
      start: timeSlot.start.toDate(),
      stop: timeSlot.end.toDate(),
      created_with: 'toggl-tracker'
    }).then(entry => {
      Printer.entry(project, timeSlot.start, timeSlot.end)
      return entry
    })
  }

  async getTimeEntries (workspaceId: string, from: Moment, to: Moment): Promise<Entry[]> {
    const entries = await this.api.getTimeEntries(workspaceId, from.format(), to.format())
    return entries
      .filter((it: any) => it.wid.toString() === workspaceId)
      .map(this.convertToEntry)
  }

  async getLastTimeEntry (workspaceId: string, from: Moment, to: Moment): Promise<Entry> {
    const timeEntries = await this.getTimeEntries(workspaceId, from, to)
    return timeEntries.pop()!!
  }

  async getTimeEntriesHoles (workspaceId: string, from: Moment, to: Moment): Promise<TimeSlot[]> {
    var entries = await this.getTimeEntries(workspaceId, from, to)

    entries.unshift(new Entry(moment(), from))
    entries.push(new Entry(to, moment()))

    return entries
      .slice(1)
      .map((_, idx) => new TimeSlot(entries[idx].stop, entries[idx + 1].start))
      .filter(it => it.end.diff(it.start) > 0)
  }

  async getActiveProjects (workspaceId: string): Promise<Project[]> {
    const togglProjects = await this.api.getActiveProjects(workspaceId)
    const projects = togglProjects.map(this.convertToProject)
    projects.unshift(new Project())
    return projects
  }

  async getAllProjects (workspaceId: string): Promise<Project[]> {
    const togglProjects = await this.api.getAllProjects(workspaceId)
    const projects = togglProjects.map(this.convertToProject)
    projects.unshift(new Project())
    return projects
  }

  async getClients (): Promise<Client[]> {
    const togglClients = await this.api.getClients()
    return togglClients.map(this.convertToClient)
  }

  async getProject (projectId?: number): Promise<Project> {
    if (projectId === undefined) return new Project()
    const project = await this.api.getProject(projectId)
    return this.convertToProject(project)
  }

  async getTasks (projectId?: number): Promise<Task[]> {
    const togglTasks = await this.api.getTasks(projectId)
    const tasks = togglTasks.map(this.convertToTask)
    tasks.push(new Task())
    return tasks
  }

  async getTask (taskId?: number): Promise<Task> {
    if (taskId === undefined) return new Task()
    const task = await this.api.getTask(taskId)
    return task !== undefined ? task : new Task()
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
}