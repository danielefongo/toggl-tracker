import { describe, it } from 'mocha'
import { equal } from 'assert'
import { Config } from '../../src/model/config'

describe('Config', () => {
  it('loads valid json', () => {
    const validJson = {
      'workingDays': ['Monday'],
      'workingHoursIntervals': '9-10',
      'lookForwardDays': 1,
      'lookBehindDays': 30,
      'togglToken': '943667258da78ccff0423e0eb9ec56c4',
      'togglWorkspace': '766453',
      'googleToken': '',
      'googleLocale': ''
    }

    const config = new Config(validJson)
    equal(config.isValid(), true)
  })

  it('checks working days', () => {
    equal(Config.validateWorkingDays(['Monday']), true)

    equal(Config.validateWorkingDays(['Wtf']), false)
    equal(Config.validateWorkingDays(['Monday', 'Wtf']), false)
    equal(Config.validateWorkingDays(undefined), false)
  })

  it('checks working hours intervals', () => {
    equal(Config.validateWorkingHoursIntervals('9-10'), true)

    equal(Config.validateWorkingHoursIntervals('z'), false)
    equal(Config.validateWorkingHoursIntervals(undefined), false)
  })

  it('checks days', () => {
    equal(Config.validateDaysNumber(1), true)
    equal(Config.validateDaysNumber('1'), true)

    equal(Config.validateDaysNumber({}), false)
    equal(Config.validateDaysNumber(-1), false)
    equal(Config.validateDaysNumber(0.1), false)
    equal(Config.validateDaysNumber('a'), false)
    equal(Config.validateDaysNumber(undefined), false)
  })

  it('checks toggl token', () => {
    equal(Config.validateTogglToken('any not empty string'), true)

    equal(Config.validateTogglToken(''), false)
    equal(Config.validateTogglToken(' '), false)
    equal(Config.validateTogglToken(undefined), false)
  })

  it('checks toggl workspace', () => {
    equal(Config.validateTogglWorkspace('any not empty string'), true)

    equal(Config.validateTogglWorkspace(''), false)
    equal(Config.validateTogglWorkspace(' '), false)
    equal(Config.validateTogglWorkspace(undefined), false)
  })
})
