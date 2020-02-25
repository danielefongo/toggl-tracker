module.exports = {
  entry (project, startMoment, endMoment) {
    return startMoment.format('MMM DD') + ', ' + startMoment.format('HH:mm') + ' -> ' + endMoment.format('HH:mm') + ' on "' + project.name + '"'
  }
}
