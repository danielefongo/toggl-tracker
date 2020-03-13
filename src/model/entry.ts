import { Moment } from 'moment'
import { TimeSlot } from './timeSlot'

export class Entry {
  slot: TimeSlot
  description: string
  id?: number
  pid?: number
  tid?: number

  constructor (start: Moment, end: Moment, description?: string, id?: number, pid?: number, tid?: number) {
    this.description = description !== undefined ? description : ""
    this.id = id
    this.slot = new TimeSlot(start, end)
    this.pid = pid
    this.tid = tid
  }
}
