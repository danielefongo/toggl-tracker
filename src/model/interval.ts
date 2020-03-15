import { Time } from './time'
import moment, { Moment } from 'moment'

export class Interval {
  start: Time
  end: Time

  constructor (start: Time, end: Time) {
    this.start = start
    this.end = end
  }

  applyStartTo (initialMoment: Moment): Moment {
    return moment(initialMoment).hours(this.start.hours).minutes(this.start.minutes)
  }

  applyEndTo (initialMoment: Moment): Moment {
    return moment(initialMoment).hours(this.end.hours).minutes(this.end.minutes)
  }

  isValid () {
    return this.start.isValid() &&
      this.end.isValid() &&
      this.start.diff(this.end) < 0
  }
}