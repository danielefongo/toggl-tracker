import { afterEach, beforeEach, describe, it } from 'mocha'
import chai from 'chai'
import sinon from 'sinon'
import moment from 'moment'

import { TimeSlotter } from '../src/timeSlotter'
import { Time } from '../src/model/time'
import { Interval } from '../src/model/interval'
import { DaysApi } from '../src/daysApi'
import { TimeSlot } from '../src/model/timeSlot'

const daysApi = new DaysApi([], 'any', 'any')

const { deepInclude, lengthOf } = chai.assert

describe('Time Slotter', () => {
  const day = moment('2020-01-01')
  const nineOClock = moment(day).hours(9)
  const tenOClock = moment(day).hours(10)
  const elevenOClock = moment(day).hours(11)
  const twelveOClock = moment(day).hours(12)

  it('slotsIn returns empty list if slots have start equal to end', async () => {
    const intervals = [intervalIn(9, 12)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(new TimeSlot(nineOClock, nineOClock))

    lengthOf(slots, 0)
  })

  it('slotsIn returns empty list if outside interval', async () => {
    const intervals = [intervalIn(7, 8)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(new TimeSlot(nineOClock, tenOClock))

    lengthOf(slots, 0)
  })

  it('slotsIn does not trim range inside interval', async () => {
    const intervals = [intervalIn(9, 12)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(new TimeSlot(tenOClock, elevenOClock))

    deepInclude(slots[0], { start: tenOClock, end: elevenOClock })
  })

  it('slotsIn trims to interval', async () => {
    const intervals = [intervalIn(10, 11)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(new TimeSlot(nineOClock, twelveOClock))

    deepInclude(slots[0], { start: tenOClock, end: elevenOClock })
  })

  it('slotsIn gives multiple slots', async () => {
    const intervals = [intervalIn(10, 11), intervalIn(11, 12)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsIn(new TimeSlot(tenOClock, twelveOClock))

    deepInclude(slots[0], { start: tenOClock, end: elevenOClock })
    deepInclude(slots[1], { start: elevenOClock, end: twelveOClock })
  })

  it('slotsInMany returns empty list if slots have start equal to end', async () => {
    const intervals = [intervalIn(9, 12)]
    const baseSlots = [new TimeSlot(nineOClock, nineOClock)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsInMany(baseSlots)

    lengthOf(slots, 0)
  })

  it('slotsInMany handles multiple data', async () => {
    const intervals = [intervalIn(9, 12)]
    const baseSlots = [new TimeSlot(nineOClock, tenOClock), new TimeSlot(elevenOClock, twelveOClock)]

    const slotter = new TimeSlotter(daysApi, intervals)

    const slots = await slotter.slotsInMany(baseSlots)

    deepInclude(slots[0], { start: nineOClock, end: tenOClock })
    deepInclude(slots[1], { start: elevenOClock, end: twelveOClock })
  })

  function intervalIn (startHour, endHour) {
    return new Interval(new Time(startHour), new Time(endHour))
  }

  beforeEach(function () {
    // @ts-ignore
    sinon.stub(daysApi, 'workingDaysIn').returns([day])
  })

  afterEach(function () {
    sinon.restore()
  })

})
