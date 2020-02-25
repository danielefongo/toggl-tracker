const chai = require('chai')
var chaiSubset = require('chai-subset')
chai.use(chaiSubset)

const expect = chai.expect
const axios = require('axios')
const moment = require('moment')
const querystring = require('querystring')

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
  const entryStop = moment(day).hours(10)

  var api
  var client
  var project
  var entry

  before(async () => {
    var clientData = { client: { name: randomName(), wid: workspace } }
    client = await restPost('/clients', clientData)

    var projectData = { project: { name: randomName(), wid: workspace, is_private: true, cid: client.id } }
    project = await restPost('/projects', projectData)

    var entryData = { description: 'foo', pid: project.id, billable: project.billable, start: zuluFormat(entryStart), duration: entryStop.diff(entryStart) / 1000, created_with: 'toggl-tracker' }
    entry = await restPost('/time_entries', { time_entry: entryData })
  })

  after(async () => {
    await cleanEntries()
    await restDelete('/clients/' + client.id)
    await restDelete('/projects/' + project.id)
  })

  beforeEach(async () => {
    api = new TogglApi(token)
  })

  it('create single time entry', async () => {
    const description = randomName()
    const slot = slotIn(entryStart, entryStop)
    const createdEntry = await api.createSingleTimeEntry(project, emptyTask(), description, slot)

    expect(createdEntry).to.containSubset({
      pid: project.id,
      description: description,
      billable: project.billable,
      start: zuluFormat(entryStart),
      stop: zuluFormat(entryStop)
    })
  }).timeout(1000)

  it('get time entries', async () => {
    const entries = await api.getTimeEntries(workspace, entryStart, entryStop)

    const retrievedEntry = entries.filter(it => it.id === entry.id)[0]
    expect(retrievedEntry).to.not.equal(undefined)
    assertEntryIn(retrievedEntry, entryStart, entryStop)
  }).timeout(1000)

  it('get holes between entries', async () => {
    const holes = await api.getTimeEntriesHoles(workspace, startOfDay, endOfDay)

    assertHoleIn(holes[0], startOfDay, entryStart)
    assertHoleIn(holes[1], entryStop, endOfDay)
  }).timeout(1000)

  it('get projects', async () => {
    const projects = await api.getProjects(workspace)

    expect(projects).to.containSubset([{
      id: project.id,
      name: project.name
    }])
  }).timeout(1000)

  it('get project', async () => {
    const projects = await api.getProject(project.id)

    expect(projects).to.containSubset({
      id: project.id,
      name: project.name
    })
  }).timeout(1000)

  it('get clients', async () => {
    const clients = await api.getClients()

    expect(clients).to.containSubset([{
      id: client.id,
      name: client.name
    }])
  }).timeout(1000)

  it('get empty list of tasks if not available', async () => {
    const tasks = await api.getTasks(project.id)

    expect(tasks).to.containSubset([{ id: null, name: '[no task]' }])
  }).timeout(1000)

  function assertEntryIn (entry, start, stop) {
    expect(entry.start.isSame(start)).to.equal(true)
    expect(entry.stop.isSame(stop)).to.equal(true)
  }

  function assertHoleIn (hole, start, stop) {
    expect(hole.start.isSame(start)).to.equal(true)
    expect(hole.end.isSame(stop)).to.equal(true)
  }

  function randomName () {
    return Math.random().toString(36).substring(2, 15)
  }

  function emptyTask () {
    return { id: null, name: '[no task]' }
  }

  function slotIn (start, end) {
    return { start, end, duration: end.diff(start) / 1000 }
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
