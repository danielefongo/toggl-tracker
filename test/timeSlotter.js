const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const moment = require('moment')
const TimeSlotter = require('../src/timeSlotter')
const daysApi = { workingDaysIn: function () {} }

describe('Time Slotter', (self) => {
  const day = moment('2020-01-01')
  const nineOClock = moment(day).hours(9)
  const tenOClock = moment(day).hours(10)
  const elevenOClock = moment(day).hours(11)
  const twelveOClock = moment(day).hours(12)

  it('slotsIn returns empty list if slots have start equal to end', done => {
    const intervals = [{ start: 9, end: 12 }]

    const slotter = new TimeSlotter(daysApi, intervals)

    slotter.slotsIn(nineOClock, nineOClock).then(slots => {
      expect(slots.length).to.equal(0)
      done()
    })
  }).timeout(100)

  it('slotsIn returns empty list if outside interval', done => {
    const intervals = [{ start: 7, end: 8 }]

    const slotter = new TimeSlotter(daysApi, intervals)

    slotter.slotsIn(nineOClock, tenOClock).then(slots => {
      expect(slots.length).to.equal(0)
      done()
    })
  }).timeout(100)

  it('slotsIn does not trim range inside interval', done => {
    const intervals = [{ start: 9, end: 12 }]

    const slotter = new TimeSlotter(daysApi, intervals)

    slotter.slotsIn(tenOClock, elevenOClock).then(slots => {
      shouldHaveRange(slots[0], tenOClock, elevenOClock)
      done()
    })
  }).timeout(100)

  it('slotsIn trims to interval', done => {
    const intervals = [{ start: 10, end: 11 }]

    const slotter = new TimeSlotter(daysApi, intervals)

    slotter.slotsIn(nineOClock, twelveOClock).then(slots => {
      shouldHaveRange(slots[0], tenOClock, elevenOClock)
      done()
    })
  }).timeout(100)

  it('slotsIn gives multiple slots', done => {
    const intervals = [{ start: 10, end: 11 }, { start: 11, end: 12 }]

    const slotter = new TimeSlotter(daysApi, intervals)

    slotter.slotsIn(tenOClock, twelveOClock)
      .then(slots => {
        shouldHaveRange(slots[0], tenOClock, elevenOClock)
        shouldHaveRange(slots[1], elevenOClock, twelveOClock)
        done()
      })
  }).timeout(100)

  it('slotsInMany returns empty list if slots have start equal to end', done => {
    const intervals = [{ start: 9, end: 12 }]
    const startEnd = [{ start: nineOClock, end: nineOClock }]

    const slotter = new TimeSlotter(daysApi, intervals)

    slotter.slotsInMany(startEnd).then(slots => {
      expect(slots.length).to.equal(0)
      done()
    })
  }).timeout(100)

  it('slotsInMany handles multiple data', done => {
    const intervals = [{ start: 9, end: 12 }]
    const startEnd = [{ start: nineOClock, end: tenOClock }, { start: elevenOClock, end: twelveOClock }]

    const slotter = new TimeSlotter(daysApi, intervals)

    slotter.slotsInMany(startEnd).then(slots => {
      shouldHaveRange(slots[0], nineOClock, tenOClock)
      shouldHaveRange(slots[1], elevenOClock, twelveOClock)
      done()
    })
  }).timeout(100)

  beforeEach(function () {
    sinon.stub(daysApi, 'workingDaysIn').returns([day])
  })

  afterEach(function () {
    sinon.restore()
  })

  function shouldHaveRange (slot, start, end) {
    expect(slot.start.isSame(start)).to.equal(true)
    expect(slot.end.isSame(end)).to.equal(true)
  }
})
