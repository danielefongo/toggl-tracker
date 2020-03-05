import { describe, it } from 'mocha'
import chai from 'chai'
import moment from 'moment'
import { TimeSlot } from '../../src/model/timeSlot'

const { equal } = chai.assert

describe('TimeSlot', () => {
  it('calculate duration', () => {
    const tenOClock = moment().hours(10)
    const elevenOClock = moment().hours(11)
    const interval = new TimeSlot(tenOClock, elevenOClock)

    equal(interval.duration, 3600)
  })
})
