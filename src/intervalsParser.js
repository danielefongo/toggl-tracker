module.exports = function () {
  this.parse = function (intervalsString) {
    if (isNotValid(intervalsString)) { return [] }

    return intervalsString.split(',')
      .map(removeSpaces)
      .map(interval => {
        return {
          start: Number(interval.split('-')[0]),
          end: Number(interval.split('-')[1])
        }
      })
  }

  function removeSpaces (it) {
    return it.replace(/ /g, '')
  }

  function isNotValid (string) {
    return string.match(/(\s*\d+\s*-\s*\d+\s*)+/g, '') === null
  }
}
