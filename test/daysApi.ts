import { describe, it, afterEach } from 'mocha'
import chai from 'chai'
import sinon from 'sinon'
import axios from 'axios'
import moment from 'moment'

import { DaysApi } from '../src/daysApi'

const { deepEqual, lengthOf } = chai.assert

describe('Days Api', () => {
  const apiKey = 'any'
  const locale = 'any'

  const friday = moment('2020-02-14')
  const saturday = moment('2020-02-15')
  const sunday = moment('2020-02-16')
  const monday = moment('2020-02-17')
  const tuesday = moment('2020-02-18')

  it('returns 0 weekend days', async () => {
    const workingDays = ['Monday', 'Tuesday']

    var api = new DaysApi(workingDays, apiKey, locale)
    const days = await api.weekendDaysIn(monday, tuesday)

    lengthOf(days, 0)
  }).timeout(100)

  it('returns weekend days in range', async () => {
    const workingDays = ['Friday', 'Monday']

    var api = new DaysApi(workingDays, apiKey, locale)
    const days = await api.weekendDaysIn(friday, monday)

    deepEqual(days[0], saturday)
    deepEqual(days[1], sunday)
  }).timeout(100)

  it('returns festive days in range', async () => {
    makeItFestive(monday)

    var api = new DaysApi([], apiKey, locale)
    const days = await api.festiveDaysIn(friday, tuesday)

    deepEqual(days[0], monday)
  }).timeout(100)

  it('do not return festive days outside range', async () => {
    makeItFestive(sunday)

    var api = new DaysApi([], apiKey, locale)

    const days = await api.festiveDaysIn(monday, tuesday)

    lengthOf(days, 0)
  }).timeout(100)

  it('returns working days in range', async () => {
    const workingDays = ['Friday', 'Monday', 'Tuesday']

    makeItFestive(monday)

    var api = new DaysApi(workingDays, apiKey, locale)

    const days = await api.workingDaysIn(friday, tuesday)

    deepEqual(days[0], friday)
    deepEqual(days[1], tuesday)
  }).timeout(100)

  function makeItFestive (day) {
    const nextDay = moment(day).add(1, 'day')
    sinon.stub(axios, 'get').returns(new Promise((resolve, reject) => {
      resolve(
        {
          data: {
            items: [{
              start: { date: day.format('YYYY-MM-DD') },
              end: { date: nextDay.format('YYYY-MM-DD') }
            }]
          }
        }
      )
    }))
  }

  afterEach(function () {
    sinon.restore()
  })
})
