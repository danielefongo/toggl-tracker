const chai = require('chai')
const expect = chai.expect

const IntervalsParser = require('../src/intervalsParser')

describe('Interval Parser', (self) => {
  it('handles single interval', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2:30-3:30')

    expect(intervals[0]).to.deep.equal({ start: { hours: 2, minutes: 30 }, end: { hours: 3, minutes: 30 } })
    done()
  }).timeout(100)

  it('handles multiple intervals', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2-3,3-4')

    expect(intervals[0]).to.deep.equal({ start: { hours: 2, minutes: 0 }, end: { hours: 3, minutes: 0 } })
    expect(intervals[1]).to.deep.equal({ start: { hours: 3, minutes: 0 }, end: { hours: 4, minutes: 0 } })
    done()
  }).timeout(100)

  it('handles spaces', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2 -3, 3 -4')

    expect(intervals[0]).to.deep.equal({ start: { hours: 2, minutes: 0 }, end: { hours: 3, minutes: 0 } })
    expect(intervals[1]).to.deep.equal({ start: { hours: 3, minutes: 0 }, end: { hours: 4, minutes: 0 } })
    done()
  }).timeout(100)

  it('generates empty interval list with blank string', done => {
    var parser = new IntervalsParser()

    expect(parser.parse(' ')).to.deep.equal([])
    done()
  }).timeout(100)

  it('generates empty interval list with wrong string', done => {
    var parser = new IntervalsParser()

    expect(parser.parse('wtf')).to.deep.equal([])
    done()
  }).timeout(100)

  it('generates empty interval list with invalid ranges', done => {
    var parser = new IntervalsParser()

    expect(parser.parse('25-26')).to.deep.equal([])
    done()
  }).timeout(100)
})
