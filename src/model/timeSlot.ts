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

  get description () {
    const startString = monthDay(this.start) + ', ' + hoursAndMinutes(this.start)
    let endString: string

    if(daysBetween(this.start, this.end) != 0)
      endString = monthDay(this.end) + ', ' + hoursAndMinutes(this.end)
    else
      endString = hoursAndMinutes(this.end)

    return startString + ' -> ' + endString
  }
}

function daysBetween(start: Moment, end: Moment) {
  return end.diff(start, 'days')
}

function monthDay (moment: Moment) {
  return moment.format('MMM DD')
}

function hoursAndMinutes (moment: Moment) {
  return moment.format('HH:mm')
}