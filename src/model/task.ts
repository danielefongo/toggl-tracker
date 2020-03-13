export class Task {
  name: string
  id?: number

  constructor (name?: string, id?: number) {
    this.id = id
    this.name = name ? name : "[NO TASK]"
  }
}