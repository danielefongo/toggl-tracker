export class Task {
  name: string
  id?: number

  constructor (name?: string, id?: number) {
    this.id = id
    this.name = id !== undefined ? name : "[no task]"
  }
}