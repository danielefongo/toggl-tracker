const chai = require('chai')
var chaiSubset = require('chai-subset')
chai.use(chaiSubset)

const expect = chai.expect
const sinon = require('sinon')
const axios = require('axios')
const moment = require('moment')
const querystring = require('querystring')

const printer = require('../src/printer')
const TogglApi = require('../src/togglApi')
const token = process.env.TOGGL_TEST_TOKEN
const workspace = process.env.TOGGL_TEST_WORKSPACE

if (token === undefined || workspace === undefined) {
  throw new Error('use environment properties: TOGGL_TEST_TOKEN, TOGGL_TEST_WORKSPACE')
}

describe('Toggl Api Integration', (self) => {
  const day = moment(moment().format('YYYY-MM-DD'))
  const startOfDay = moment(day).startOf('day')
  const endOfDay = moment(day).endOf('day')
  const entryStart = moment(day).hours(9)
  const entryHalfTime = moment(day).hours(9).minutes(30)
  const entryStop = moment(day).hours(10)

  var toggl
  var client
  var project
  var entry

  before(async () => {
    var clientData = { client: { name: randomName(), wid: workspace } }
    client = await restPost('/clients', clientData)

    var projectData = { project: { name: randomName(), wid: workspace, is_private: true, cid: client.id } }
    project = await restPost('/projects', projectData)

    var entryData = {
      description: 'foo',
      pid: project.id,
      billable: project.billable,
      start: zuluFormat(entryStart),
      duration: entryStop.diff(entryStart) / 1000,
      created_with: 'toggl-tracker'
    }
    entry = await restPost('/time_entries', { time_entry: entryData })

    sinon.stub(printer, 'entry')
  })

  after(async () => {
    await cleanEntries()
    await restDelete('/clients/' + client.id)
    await restDelete('/projects/' + project.id)

    sinon.restore()
  })

  beforeEach(async () => {
    toggl = new TogglApi(token)
  })

  it('create single time entry', async () => {
    const description = randomName()

    const createdEntry = await toggl.createTimeEntry({
      description: description,
      pid: project.id,
      billable: project.billable,
      duration: entryStop.diff(entryStart) / 1000,
      start: entryStart.toDate(),
      stop: entryStop.toDate(),
      created_with: 'toggl-tracker'
    })

    expect(createdEntry).to.containSubset({
      pid: project.id,
      description: description,
      billable: project.billable,
      start: zuluFormat(entryStart),
      stop: zuluFormat(entryStop)
    })

    restDelete('/time_entries/' + entry.id)
  }).timeout(1000)

  it('get time entries', async () => {
    const entries = await toggl.getTimeEntries(workspace, entryStart.format(), entryStop.format())

    expect(entries).to.containSubset([{
      id: entry.id,
      pid: project.id
    }])
  }).timeout(1000)

  it('get empty list of entries', async () => {
    const entries = await toggl.getTimeEntries(workspace, entryHalfTime.format(), entryHalfTime.format())

    expect(entries.length).to.be.equal(0)
  }).timeout(1000)

  it('get active projects', async () => {
    const projects = await toggl.getActiveProjects(workspace)

    expect(projects).to.containSubset([{
      id: project.id,
      name: project.name,
      cid: client.id,
      billable: false
    }])
  }).timeout(1000)

  it('get project', async () => {
    const retrievedProject = await toggl.getProject(project.id)

    expect(retrievedProject).to.containSubset({
      id: retrievedProject.id,
      name: retrievedProject.name,
      cid: client.id,
      billable: false
    })
  }).timeout(1000)

  it('get clients', async () => {
    const clients = await toggl.getClients()

    expect(clients).to.containSubset([{
      id: client.id,
      name: client.name
    }])
  }).timeout(1000)

  it('get empty list of tasks project id is undefined', async () => {
    const tasks = await toggl.getTasks(undefined)

    expect(tasks).to.deep.equal([])
  }).timeout(1000)

  it('get empty list of tasks if not available', async () => {
    const tasks = await toggl.getTasks(project.id)

    expect(tasks).to.deep.equal([])
  }).timeout(1000)

  function randomName () {
    return Math.random().toString(36).substring(2, 15)
  }

  function zuluFormat (moment) {
    return moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
  }

  async function cleanEntries () {
    const query = querystring.stringify({
      start_date: moment(startOfDay).utc().format(),
      end_date: moment(endOfDay).utc().format()
    })

    await restGet('/time_entries?' + query)
      .then(entries => {
        entries.forEach(element => {
          restDelete('/time_entries/' + element.id)
        })
      })
  }

  async function restGet (url) {
    return instance.get(url)
      .then(it => {
        return it.data
      })
  }

  async function restPost (url, data) {
    return instance.post(url, data)
      .then(it => {
        return it.data.data
      })
  }

  async function restDelete (url, data) {
    return instance.delete(url)
  }

  const instance = axios.create({
    baseURL: 'https://www.toggl.com/api/v8/',
    auth: {
      username: token,
      password: 'api_token'
    }
  })
})
