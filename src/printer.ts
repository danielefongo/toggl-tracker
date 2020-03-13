import { Moment } from 'moment'
import { Project } from './model/project'

export class Printer {
  static entry (project: Project, start: Moment, end: Moment) {
    console.log(start.format('MMM DD') + ', ' + start.format('HH:mm') + ' -> ' + end.format('HH:mm') + ' on "' + project.description + '"')
  }
}
