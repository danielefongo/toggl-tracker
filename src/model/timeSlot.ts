import { Moment } from 'moment'

export class TimeSlot {
  start: Moment
  end: Moment

  constructor (start: Moment, end: Moment) {
    this.start = start
    this.end = end
  }

  get duration () {
    return this.end.diff(this.start) / 1000
  }
}