import { describe, it } from 'mocha'
import chai from 'chai'

import { IntervalsParser } from '../src/intervalsParser'

const { deepEqual, deepInclude } = chai.assert

describe('Interval Parser', () => {
  it('handles single interval', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2:30-3:30')

    deepInclude(intervals[0], {
      start: { hours: 2, minutes: 30 },
      end: { hours: 3, minutes: 30 }
    })
  })

  it('handles multiple intervals', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('9-13, 14-18')

    deepInclude(intervals[0], {
      start: { hours: 9, minutes: 0 },
      end: { hours: 13, minutes: 0 }
    })

    deepInclude(intervals[1], {
      start: { hours: 14, minutes: 0 },
      end: { hours: 18, minutes: 0 }
    })
  })

  it('handles spaces', () => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2 -3, 3 -4')

    deepInclude(intervals[0], {
      start: { hours: 2, minutes: 0 },
      end: { hours: 3, minutes: 0 }
    })

    deepInclude(intervals[1], {
      start: { hours: 3, minutes: 0 },
      end: { hours: 4, minutes: 0 }
    })
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
