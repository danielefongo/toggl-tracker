export class Client {
  name?: string
  id?: number

  constructor (name?: string, id?: number) {
    this.name = name
    this.id = id
  }

  get description() {
    return this.name ? '[' + this.name + ']' : '[NO CLIENT]'
  }
}