export class Client {
  name?: string
  id?: number

  constructor (name?: string, id?: number) {
    this.name = name ? '[' + name + ']' : '[NO CLIENT]'
    this.id = id
  }
}