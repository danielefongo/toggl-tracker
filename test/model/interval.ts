import { describe, it } from 'mocha'
import chai from 'chai'
import { Time } from '../../src/model/time'
import { Interval } from '../../src/model/interval'
import moment from 'moment'
import { equal } from 'assert'

const { deepEqual } = chai.assert

describe('Interval', () => {
  it('applies to moment', () => {
    const interval = new Interval(new Time(9), new Time(10))

    const initialMoment = moment()
    const start = interval.applyStartTo(initialMoment)
    const end = interval.applyEndTo(initialMoment)

    deepEqual(start.hours(), 9)
    deepEqual(start.minutes(), 0)
    deepEqual(end.hours(), 10)
    deepEqual(end.minutes(), 0)
  })

  it('tells if is valid', () => {
    equal(getInterval([9, 0], [10, 0]).isValid(), true)

    equal(getInterval([-9, 0], [10, 0]).isValid(), false)
    equal(getInterval([9, 0], [-10, 0]).isValid(), false)
    equal(getInterval([10, 0], [9, 0]).isValid(), false)
  })

  function getInterval (start: number[], end: number[]) {
    return new Interval(new Time(start[0], end[0]), new Time(end[0], end[1]))
  }
})

