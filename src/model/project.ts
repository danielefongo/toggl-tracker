export class Project {
  name: string
  id?: number
  cid?: number
  billable?: boolean

  constructor (name?: string, id?: number, billable?: boolean, cid?: number) {
    this.id = id
    this.cid = cid
    this.billable = billable
    this.name = name !== undefined ? name : "NO PROJECT"
  }
}