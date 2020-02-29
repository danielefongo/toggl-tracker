const chai = require('chai')
const sinon = require('sinon')

const { deepInclude, lengthOf } = chai.assert

const moment = require('moment')
const TimeSlotter = require('../src/timeSlotter')
const daysApi = { workingDaysIn: function () {} }

describe('Time Slotter', (self) => {
  const day = moment('2020-01-01')
  const nineOClock = moment(day).hours(9)
  const tenOClock = moment(day).hours(10)
  const elevenOClock = moment(day).hours(11)
  const twelveOClock = moment(day).hours(12)

  it('slotsIn returns empty list if slots have start equal to end', async () => {
    const intervals = [intervalIn(9, 12)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(nineOClock, nineOClock)

    lengthOf(slots, 0)
  })

  it('slotsIn returns empty list if outside interval', async () => {
    const intervals = [intervalIn(7, 8)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(nineOClock, tenOClock)

    lengthOf(slots, 0)
  })

  it('slotsIn does not trim range inside interval', async () => {
    const intervals = [intervalIn(9, 12)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(tenOClock, elevenOClock)

    deepInclude(slots[0], { start: tenOClock, end: elevenOClock })
  })

  it('slotsIn trims to interval', async () => {
    const intervals = [intervalIn(10, 11)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(nineOClock, twelveOClock)

    deepInclude(slots[0], { start: tenOClock, end: elevenOClock })
  })

  it('slotsIn gives multiple slots', async () => {
    const intervals = [intervalIn(10, 11), intervalIn(11, 12)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(tenOClock, twelveOClock)

    deepInclude(slots[0], { start: tenOClock, end: elevenOClock })
    deepInclude(slots[1], { start: elevenOClock, end: twelveOClock })
  })

  it('slotsInMany returns empty list if slots have start equal to end', async () => {
    const intervals = [intervalIn(9, 12)]
    const startEnd = [{ start: nineOClock, end: nineOClock }]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsInMany(startEnd)

    lengthOf(slots, 0)
  })

  it('slotsInMany handles multiple data', async () => {
    const intervals = [intervalIn(9, 12)]
    const startEnd = [{ start: nineOClock, end: tenOClock }, { start: elevenOClock, end: twelveOClock }]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsInMany(startEnd)

    deepInclude(slots[0], { start: nineOClock, end: tenOClock })
    deepInclude(slots[1], { start: elevenOClock, end: twelveOClock })
  })

  function intervalIn (startHour, endHour) {
    return { start: { hours: startHour, minutes: 0 }, end: { hours: endHour, minutes: 0 } }
  }

  beforeEach(function () {
    sinon.stub(daysApi, 'workingDaysIn').returns([day])
  })

  afterEach(function () {
    sinon.restore()
  })

})
