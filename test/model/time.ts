import { describe, it } from 'mocha'
import { Time } from '../../src/model/time'
import { equal } from 'assert'

describe('Time', () => {
  it('tells if is valid', () => {
    equal(new Time(0, 0).isValid(), true)
    equal(new Time(12, 30).isValid(), true)
    equal(new Time(23, 59).isValid(), true)

    equal(new Time(24, 0).isValid(), false)
    equal(new Time(-1, 0).isValid(), false)
    equal(new Time(12, 60).isValid(), false)
    equal(new Time(12, -1).isValid(), false)
  })

  it('can calculate difference from another time', () => {
    const nineOClock = new Time(9)
    const tenOClock = new Time(10)
    const halfPastTen = new Time(10, 30)

    equal(halfPastTen.diff(tenOClock), 30)
    equal(tenOClock.diff(nineOClock), 60)
    equal(halfPastTen.diff(nineOClock), 90)

    equal(tenOClock.diff(halfPastTen), -30)
    equal(nineOClock.diff(tenOClock), -60)
    equal(nineOClock.diff(halfPastTen), -90)
  })
})

