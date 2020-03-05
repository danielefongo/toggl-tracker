import { Time } from './model/time'
import { Interval } from './model/interval'

export class IntervalsParser {
  parse (intervalsString: string): Interval[] {
    if (this.isNotValid(intervalsString)) { return [] }

    return intervalsString.split(',')
      .map(this.removeSpaces)
      .map(interval => {
        const start = this.extractTime(interval.split('-')[0])
        const end = this.extractTime(interval.split('-')[1])
        return new Interval(start, end)
      })
  }

  private removeSpaces (it: string) {
    return it.replace(/ /g, '')
  }

  private isNotValid (it: string) {
    return it.search(/(\s*\d+(:\d+)?\s*-\s*\d+(:\d+)?\s*)+/g) === -1
  }

  private extractTime (it: string) {
    const hours = Number(it.split(':')[0])
    const minutes = it.split(':')[1] !== undefined ? Number(it.split(':')[1]) : 0
    return new Time(hours, minutes)
  }
}