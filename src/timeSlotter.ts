import moment, { Moment } from 'moment'
import { TimeSlot } from './model/timeSlot'
import { Interval } from './model/interval'
import { DaysApi } from './daysApi'

export class TimeSlotter {
  private daysApi: DaysApi
  private intervals: Interval[]

  constructor (daysApi: DaysApi, intervals: Interval[]) {
    this.daysApi = daysApi
    this.intervals = intervals
  }

  async slotsIn (slot: TimeSlot): Promise<TimeSlot[]> {
    const workingDays = await this.daysApi.workingDaysIn(slot.start, slot.end)

    return this.slots(slot, workingDays, this.intervals)
  }

  async slotsInMany (slots: TimeSlot[]): Promise<TimeSlot[]> {
    const globalStart = moment.min(slots.map(it => it.start))
    const globalEnd = moment.max(slots.map(it => it.end))

    const workingDays = await this.daysApi.workingDaysIn(globalStart, globalEnd)

    return slots
      .map(it => this.slots(it, workingDays, this.intervals))
      .reduce(this.flatten)
  }

  async squash (slots: TimeSlot[]) {
    if (slots.length === 0) return []
    const finalSlots = [slots[0]]

    slots.slice(1).forEach(slot => {
      let previousSlot = finalSlots.slice(-1)[0]
      if (slot.start.diff(previousSlot.end) === 0)
        previousSlot.end = moment(slot.end)
      else finalSlots.push(slot)
    })
    return finalSlots
  }

  private slots (slot: TimeSlot, workingDays: Moment[], intervals: Interval[]): TimeSlot[] {
    return workingDays
      .map(day => intervals.map((interval: Interval) => this.slotWithinInterval(slot, day, interval)))
      .reduce((acc, slots) => acc.concat(slots))
      .filter(it => it.duration > 0)
  }

  private slotWithinInterval (slot: TimeSlot, day: Moment, interval: Interval): TimeSlot {
    const intervalStartMoment = interval.applyStartTo(day)
    const intervalEndMoment = interval.applyEndTo(day)

    const startMoment = moment.max(slot.start, intervalStartMoment)
    const endMoment = moment.min(slot.end, intervalEndMoment)
    return new TimeSlot(startMoment, endMoment)
  }

  private flatten (accumulator, array) {
    return [...accumulator, ...array]
  }
}