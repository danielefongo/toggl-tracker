module.exports = {
  entry (project, startMoment, endMoment) {
    console.log(startMoment.format('MMM DD') + ', ' + startMoment.format('HH:mm') + ' -> ' + endMoment.format('HH:mm') + ' on "' + project.name + '"')
  }
}
