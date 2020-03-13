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
}