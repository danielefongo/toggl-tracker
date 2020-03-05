import { Moment } from 'moment'

export class Entry {
  start: Moment
  stop: Moment
  description: string
  id?: number
  pid?: number
  tid?: number

  constructor (start: Moment, stop: Moment, description?: string, id?: number, pid?: number, tid?: number) {
    this.description = description !== undefined ? description : ""
    this.id = id
    this.start = start
    this.stop = stop
    this.pid = pid
    this.tid = tid
  }
}
