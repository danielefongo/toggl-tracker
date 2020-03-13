import { describe, it } from 'mocha'
import chai from 'chai'
import moment from 'moment'
import { TimeSlot } from '../../src/model/timeSlot'

const { equal } = chai.assert

describe('TimeSlot', () => {
  it('calculate duration', () => {
    const tenOClock = moment().hours(10)
    const elevenOClock = moment(tenOClock).add(1, 'hour')
    const interval = new TimeSlot(tenOClock, elevenOClock)

    equal(interval.duration, 3600)
  })

  it('description when start and end are in the same day', () => {
    moment.locale('en')
    const tenOClock = moment('2020-01-01').hours(10)
    const elevenOClock = moment('2020-01-01').hours(11)
    const interval = new TimeSlot(tenOClock, elevenOClock)

    equal(interval.description, 'Jan 01, 10:00 -> 11:00')
  })

  it('description when start and end are in different days', () => {
    moment.locale('en')
    const tenOClock = moment('2020-01-01').hours(10)
    const elevenOClock = moment('2020-01-02').hours(11)
    const interval = new TimeSlot(tenOClock, elevenOClock)

    equal(interval.description, 'Jan 01, 10:00 -> Jan 02, 11:00')
  })
})
