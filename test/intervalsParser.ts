import { describe, it } from 'mocha'
import chai from 'chai'

import { IntervalsParser } from '../src/intervalsParser'
import { Time } from '../src/model/time'

const { deepEqual } = chai.assert

describe('Interval Parser', () => {
  it('handles single interval', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2:30-3:30')

    deepEqual(intervals[0].start, new Time(2, 30))
    deepEqual(intervals[0].end, new Time(3, 30))
  })

  it('handles multiple intervals', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('9-13, 14-18')

    deepEqual(intervals[0].start, new Time(9))
    deepEqual(intervals[0].end, new Time(13))

    deepEqual(intervals[1].start, new Time(14))
    deepEqual(intervals[1].end, new Time(18))
  })

  it('handles spaces', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2 -3, 3 -4')

    deepEqual(intervals[0].start, new Time(2))
    deepEqual(intervals[0].end, new Time(3))

    deepEqual(intervals[1].start, new Time(3))
    deepEqual(intervals[1].end, new Time(4))
  })

  it('generates empty interval list with blank string', () => {
    var parser = new IntervalsParser()

    deepEqual(parser.parse(' '), [])
  })

  it('generates empty interval list with wrong string', () => {
    var parser = new IntervalsParser()

    deepEqual(parser.parse('wtf'), [])
  })
})
