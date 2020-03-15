export class Time {
  hours: number
  minutes: number

  constructor (hours: number, minutes: number = 0) {
    this.hours = hours
    this.minutes = minutes
  }

  isValid () {
    return this.hours >= 0 && this.hours < 24 &&
      this.minutes >= 0 && this.minutes < 60
  }

  diff (other: Time) {
    return (this.hours * 60 + this.minutes) - (other.hours * 60 + other.minutes)
  }
}