export class IntervalsParser {
  parse (intervalsString) {
    if (this.isNotValid(intervalsString)) { return [] }

    return intervalsString.split(',')
      .map(this.removeSpaces)
      .map(interval => {
        return {
          start: this.extractHoursAndMinutes(interval.split('-')[0]),
          end: this.extractHoursAndMinutes(interval.split('-')[1])
        }
      })
  }

  private removeSpaces (it) {
    return it.replace(/ /g, '')
  }

  private isNotValid (string) {
    return string.match(/(\s*\d+(:\d+)?\s*-\s*\d+(:\d+)?\s*)+/g, '') === null
  }

  private extractHoursAndMinutes (it) {
    const hours = Number(it.split(':')[0])
    const minutes = it.split(':')[1] !== undefined ? Number(it.split(':')[1]) : 0
    return { hours, minutes }
  }
}