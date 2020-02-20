const chai = require('chai')
var chaiSubset = require('chai-subset')
chai.use(chaiSubset)

const expect = chai.expect
const axios = require('axios')
const moment = require('moment')
const querystring = require('querystring')

const TogglApi = require('../src/togglApi')
const token = process.env.TOGGL_TEST_TOKEN // TODO: process.env.token
const workspace = process.env.TOGGL_TEST_WORKSPACE

if (token === undefined || workspace === undefined) {
  throw new Error('use environment properties: TOGGL_TEST_TOKEN, TOGGL_TEST_WORKSPACE')
}

describe('Toggl Api Integration', (self) => {
  const day = moment('2020-01-01')
  const startOfDay = moment(day).startOf('day')
  const endOfDay = moment(day).endOf('day')
  const nineOClock = moment(day).hours(9)
  const tenOClock = moment(day).hours(10)
  const elevenOClock = moment(day).hours(11)
  const twelveOClock = moment(day).hours(12)

  var api
  var client
  var project

  beforeEach(async () => {
    api = new TogglApi(token)

    var clientData = { client: { name: randomName(), wid: workspace } }
    client = await restPost('/clients', clientData)

    var projectData = { project: { name: randomName(), wid: workspace, is_private: true, cid: client.id } }
    project = await restPost('/projects', projectData)
  })

  afterEach(async () => {
    delay(500)
    await cleanEntries()
    await restDelete('/clients/' + client.id)
    await restDelete('/projects/' + project.id)
  })

  it('create single time entry', async () => {
    const slot = slotIn(nineOClock, tenOClock)
    const entry = await api.createSingleTimeEntry(project, emptyTask(), 'foo', slot)

    expect(entry).to.containSubset({
      pid: project.id,
      description: 'foo',
      billable: project.billable,
      start: zuluFormat(nineOClock),
      stop: zuluFormat(tenOClock)
    })
  }).timeout(1000)

  it('get time entries', async () => {
    const slot = slotIn(nineOClock, tenOClock)
    const expectedTimeEntry = await api.createSingleTimeEntry(project, emptyTask(), 'foo', slot)

    const entries = await api.getTimeEntries(workspace, startOfDay, endOfDay)

    expect(entries[0].id).to.equal(expectedTimeEntry.id)
    assertEntryIn(entries[0], nineOClock, tenOClock)
  }).timeout(1000)

  it('get holes between created entries', async () => {
    await api.createSingleTimeEntry(project, emptyTask(), 'foo', slotIn(nineOClock, tenOClock))
    await api.createSingleTimeEntry(project, emptyTask(), 'foo', slotIn(elevenOClock, twelveOClock))

    const holes = await api.getTimeEntriesHoles(workspace, nineOClock, twelveOClock)

    assertHoleIn(holes[0], tenOClock, elevenOClock)
  }).timeout(1000)

  it('get holes outside created entries', async () => {
    await api.createSingleTimeEntry(project, emptyTask(), 'foo', slotIn(nineOClock, tenOClock))

    const holes = await api.getTimeEntriesHoles(workspace, startOfDay, endOfDay)

    assertHoleIn(holes[0], startOfDay, nineOClock)
    assertHoleIn(holes[1], tenOClock, endOfDay)
  }).timeout(1000)

  it('get projects', async () => {
    const projects = await api.getProjects(workspace)

    expect(projects).to.containSubset([project])
  }).timeout(1000)

  it('get clients', async () => {
    const clients = await api.getClients()

    expect(clients).to.containSubset([client])
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
      start_date: moment(day).startOf('day').utc().format(),
      end_date: moment(day).endOf('day').utc().format()
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

async function delay (interval) {
  await new Promise((resolve, reject) => setTimeout(() => resolve(), interval))
}
