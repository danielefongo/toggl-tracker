import { Client } from './client'
import { Project } from './project'

export class Summary {
  client: Client
  project: Project
  seconds: number

  constructor (client: Client, project: Project, seconds: number) {
    this.client = client
    this.project = project
    this.seconds = seconds
  }

  get description () {
    return '[' + this.client.description + '] ' + this.project.description + ' => ' + this.hoursAsString()
  }

  private hoursAsString () {
    return this.seconds / 3600 + 'h'
  }
}