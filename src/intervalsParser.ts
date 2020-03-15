import { Time } from './model/time'
import { Interval } from './model/interval'

export class IntervalsParser {
  parse (intervalsString: string): Interval[] {
    let intervalStrings = intervalsString.split(',')

    const intervals = intervalStrings
      .map(this.removeSpaces)
      .reduce(this.extractValidIntervals.bind(this), [])

    return intervals.length == intervalStrings.length
      ? intervals
      : []
  }

  private removeSpaces (it: string = '') {
    return it.replace(/ /g, '')
  }

  private extractValidIntervals (acc, actual) {
    const start = this.extractTime(actual.split('-')[0])
    const end = this.extractTime(actual.split('-')[1])
    const interval = new Interval(start, end)
    if (interval.isValid())
      acc.push(interval)
    return acc
  }

  private extractTime (it: string = '') {
    const hours = Number(it.split(':')[0])
    const minutes = it.split(':')[1] !== undefined ? Number(it.split(':')[1]) : 0
    return new Time(hours, minutes)
  }
}