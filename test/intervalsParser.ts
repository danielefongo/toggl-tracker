import { describe, it } from 'mocha'
import chai from 'chai'

import { IntervalsParser } from '../src/intervalsParser'
import { Time } from '../src/model/time'
import { Interval } from '../src/model/interval'

const { deepEqual } = chai.assert

describe('Interval Parser', () => {
  it('handles single interval', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2:30-3:30')

    deepEqual(intervals, [
      new Interval(new Time(2, 30), new Time(3, 30))
    ])
  })

  it('handles multiple intervals', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('9-13, 14-18')

    deepEqual(intervals, [
      new Interval(new Time(9), new Time(13)),
      new Interval(new Time(14), new Time(18))
    ])
  })

  it('handles spaces', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2 -3, 3 -4')

    deepEqual(intervals, [
      new Interval(new Time(2), new Time(3)),
      new Interval(new Time(3), new Time(4))
    ])
  })

  it('generates empty interval list if something is wrong', () => {
    var parser = new IntervalsParser()

    deepEqual(parser.parse('9-10, wtf'), [])
    deepEqual(parser.parse('9-10, 10-9'), [])
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
