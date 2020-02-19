const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const axios = require('axios')
const moment = require('moment')
const DaysApi = require('../src/daysApi')

describe('Days Api', (self) => {
  const apiKey = 'any'
  const locale = 'any'

  const friday = moment('2020-02-14')
  const saturday = moment('2020-02-15')
  const sunday = moment('2020-02-16')
  const monday = moment('2020-02-17')
  const tuesday = moment('2020-02-18')

  it('returns 0 weekend days', done => {
    const workingDays = ['Monday', 'Tuesday']

    var api = new DaysApi(workingDays, apiKey, locale)
    api.weekendDaysIn(monday, tuesday)
      .then(days => {
        expect(days.length).to.equal(0)
        done()
      })
  }).timeout(100)

  it('returns weekend days in range', done => {
    const workingDays = ['Friday', 'Monday']

    var api = new DaysApi(workingDays, apiKey, locale)
    api.weekendDaysIn(friday, monday)
      .then(days => {
        expect(saturday.isSame(days[0])).to.equal(true)
        expect(sunday.isSame(days[1])).to.equal(true)
        done()
      })
  }).timeout(100)

  it('returns festive days in range', done => {
    makeItFestive(monday)

    var api = new DaysApi([], apiKey, locale)
    api.festiveDaysIn(friday, tuesday)
      .then(days => {
        expect(monday.isSame(days[0])).to.equal(true)
        done()
      })
  }).timeout(100)

  it('do not return festive days outside range', done => {
    makeItFestive(sunday)

    var api = new DaysApi([], apiKey, locale)
    api.festiveDaysIn(monday, tuesday)
      .then(days => {
        expect(days.length).to.equal(0)
        done()
      })
  }).timeout(100)

  it('returns working days in range', done => {
    const workingDays = ['Friday', 'Monday', 'Tuesday']

    makeItFestive(monday)

    var api = new DaysApi(workingDays, apiKey, locale)
    api.workingDaysIn(friday, tuesday)
      .then(days => {
        expect(friday.isSame(days[0])).to.equal(true)
        expect(tuesday.isSame(days[1])).to.equal(true)
        done()
      })
  }).timeout(100)

  function makeItFestive (day) {
    const nextDay = moment(day).add(1, 'day')
    sinon.stub(axios, 'get').returns(new Promise((resolve, reject) => {
      resolve(
        { data: { items: [{ start: { date: day.format('YYYY-MM-DD') }, end: { date: nextDay.format('YYYY-MM-DD') } }] } }
      )
    }))
  }

  afterEach(function () {
    sinon.restore()
  })
})
