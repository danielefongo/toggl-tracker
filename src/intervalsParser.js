module.exports = function () {
  this.parse = function (intervalsString) {
    if (isNotValid(intervalsString)) { return [] }

    return intervalsString.split(',')
      .map(removeSpaces)
      .map(interval => {
        return {
          start: extractHoursAndMinutes(interval.split('-')[0]),
          end: extractHoursAndMinutes(interval.split('-')[1])
        }
      })
  }

  function removeSpaces (it) {
    return it.replace(/ /g, '')
  }

  function isNotValid (string) {
    return string.match(/(\s*[0-23](:[0-59])?\s*-\s*[0-23](:[0-59])?\s*)+/g, '') === null
  }

  function extractHoursAndMinutes (it) {
    const hours = Number(it.split(':')[0])
    const minutes = it.split(':')[1] !== undefined ? Number(it.split(':')[1]) : 0
    return { hours, minutes }
  }
}
