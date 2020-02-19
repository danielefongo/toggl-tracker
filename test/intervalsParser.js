const chai = require('chai')
const expect = chai.expect

const IntervalsParser = require('../src/intervalsParser')

describe('Interval Parser', (self) => {
  it('handles single interval', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2-3')

    expect(intervals[0]).to.deep.equal({ start: 2, end: 3 })
    done()
  }).timeout(100)

  it('handles multiple intervals', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2-3,3-4')

    expect(intervals[0]).to.deep.equal({ start: 2, end: 3 })
    expect(intervals[1]).to.deep.equal({ start: 3, end: 4 })
    done()
  }).timeout(100)

  it('handles spaces', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('2 -3, 3 -4')

    expect(intervals[0]).to.deep.equal({ start: 2, end: 3 })
    expect(intervals[1]).to.deep.equal({ start: 3, end: 4 })
    done()
  }).timeout(100)

  it('generates empty interval list with blank string', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse(' ')

    expect(intervals.length).to.be.equal(0)
    done()
  }).timeout(100)

  it('generates empty interval list with wrong string', done => {
    var parser = new IntervalsParser()

    const intervals = parser.parse('wtf')

    expect(intervals.length).to.be.equal(0)
    done()
  }).timeout(100)
})
