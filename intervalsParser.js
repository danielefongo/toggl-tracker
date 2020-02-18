module.exports = function () {
  this.parse = function (intervalsString) {
    return intervalsString.split(',')
      .map(it => it.trim())
      .map(interval => {
        return {
          start: Number(interval.split('-')[0]),
          end: Number(interval.split('-')[1])
        }
      })
  }
}
