import { Project } from './model/project'
import { TimeSlot } from './model/timeSlot'

export class Printer {
  static entry (project: Project, slot: TimeSlot) {
    console.log(slot.description + ' on "' + project.description + '"')
  }
}
