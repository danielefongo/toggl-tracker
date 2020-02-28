const chai = require('chai')
var chaiSubset = require('chai-subset')
chai.use(chaiSubset)

const expect = chai.expect
const sinon = require('sinon')
const moment = require('moment')

const printer = require('../src/printer')
const Toggl = require('../src/toggl')
const TogglApi = require('../src/togglApi')

describe('Toggl', () => {
  var mockPrinter

  var toggl
  const api = new TogglApi('123')

  beforeEach(async () => {
    mockPrinter = sinon.mock(printer)
    toggl = new Toggl(api)
  })

  afterEach(async () => {
    sinon.restore()
    mockPrinter.restore()
  })

  it('prints entry on successful entry creation', async () => {
    simulateEntryCreation({})
    mockPrinter.expects('entry').once()

    await toggl.createTimeEntry(PROJECT, TASK, 'FOO', TIMESLOT)

    mockPrinter.verify()
  })

  it('converts moments to dates when creating entry', async () => {
    const stubbed = simulateEntryCreation({})
    mockPrinter.expects('entry') // TODO remove this when passing printer as dependency

    await toggl.createTimeEntry(PROJECT, TASK, 'FOO', TIMESLOT)

    expect(stubbed.getCalls()[0].firstArg).to.containSubset({
      start: TIMESLOT.start.toDate(),
      stop: TIMESLOT.end.toDate()
    })
  })

  it('filters retrieved time entries', async () => {
    const workspace = '123'
    const anotherWorkspace = '321'

    const expectedEntry = aBasicEntry(1, workspace)

    sinon.stub(api, 'getTimeEntries').resolves([
      expectedEntry,
      aBasicEntry(2, anotherWorkspace)
    ])

    const entries = await toggl.getTimeEntries(workspace, moment(), moment())

    expect(entries).to.deep.equal([expectedEntry])
  })

  it('converts retrieved entry timestamps to moments', async () => {
    const expectedMoment = moment('2020-01-01')

    simulateEntries([aBasicEntry(1, ANY_WORKSPACE, '2020-01-01', '2020-01-01')])

    const entries = await toggl.getTimeEntries(ANY_WORKSPACE, moment(), moment())

    expect(entries[0]).to.containSubset({
      start: expectedMoment,
      stop: expectedMoment
    })
  })

  it('obtains last time entry', async () => {
    const expectedEntry = aBasicEntry(1, 'any')

    simulateEntries([
      aBasicEntry(1, ANY_WORKSPACE),
      expectedEntry
    ])

    const entries = await toggl.getLastTimeEntry(ANY_WORKSPACE, moment(), moment())

    expect(entries).to.deep.equal(expectedEntry)
  })

  it('extracts 0 holes between retrieved entries if they are consecutive', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-03')

    simulateEntries([
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-01', '2020-01-02'),
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-02', '2020-01-03')
    ])

    const holes = await toggl.getTimeEntriesHoles(ANY_WORKSPACE, startMoment, endMoment)

    expect(holes.length).to.be.equal(0)
  })

  it('extracts holes between retrieved entries', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-04')

    simulateEntries([
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-01', '2020-01-02'),
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-03', '2020-01-04')
    ])

    const holes = await toggl.getTimeEntriesHoles(ANY_WORKSPACE, startMoment, endMoment)

    expect(holes.length).to.be.equal(1)
    expect(holes[0]).to.containSubset({
      start: moment('2020-01-02'),
      end: moment('2020-01-03')
    })
  })

  it('extracts holes outside retrieved entries', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-04')

    simulateEntries([
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-02', '2020-01-03')
    ])

    const holes = await toggl.getTimeEntriesHoles(ANY_WORKSPACE, startMoment, endMoment)

    expect(holes.length).to.be.equal(2)
    expect(holes[0]).to.containSubset({
      start: moment('2020-01-01'),
      end: moment('2020-01-02')
    })
    expect(holes[1]).to.containSubset({
      start: moment('2020-01-03'),
      end: moment('2020-01-04')
    })
  })

  it('obtains all active projects and an empty project as first element', async () => {
    simulateProjects([PROJECT])

    const projects = await toggl.getActiveProjects(ANY_WORKSPACE)

    expect(projects).to.deep.equal([
      { id: undefined, name: 'NO PROJECT' },
      PROJECT
    ])
  })

  it('obtains all projects and an empty project as first element', async () => {
    simulateProjects([PROJECT])

    const projects = await toggl.getAllProjects(ANY_WORKSPACE)

    expect(projects).to.deep.equal([
      { id: undefined, name: 'NO PROJECT' },
      PROJECT
    ])
  })

  it('obtains all tasks and an empty task', async () => {
    simulateTasks([TASK])

    const tasks = await toggl.getTasks(ANY_PROJECT_ID)

    expect(tasks).to.containSubset([
      TASK,
      { id: undefined, name: '[no task]' }
    ])
  })

  it('obtains task if api returns a valid task', async () => {
    simulateTask(TASK)

    const task = await toggl.getTask(ANY_TASK_ID)

    expect(task).to.deep.equal(TASK)
  })

  it('obtains empty task if api returns undefined', async () => {
    simulateTask(undefined)

    const task = await toggl.getTask(ANY_TASK_ID)

    expect(task).to.deep.equal(
      { id: undefined, name: '[no task]' }
    )
  })

  function aBasicEntry (id, workspace, startString, stopString) {
    return {
      id,
      start: startString,
      stop: stopString,
      wid: workspace
    }
  }

  function simulateEntryCreation (entry) {
    return sinon.stub(api, 'createTimeEntry').resolves(entry)
  }

  function simulateEntries (array) {
    sinon.stub(api, 'getTimeEntries').resolves(array)
  }

  function simulateProjects (array) {
    sinon.stub(api, 'getActiveProjects').resolves(array)
    sinon.stub(api, 'getAllProjects').resolves(array)
  }

  function simulateTasks (array) {
    sinon.stub(api, 'getTasks').resolves(array)
  }

  function simulateTask (task) {
    sinon.stub(api, 'getTask').resolves(task)
  }

  const PROJECT = { id: 'projectId', billable: true, cid: 'clientId' }
  const TASK = { id: 'taskId', name: 'task' }
  const TIMESLOT = { start: moment(), end: moment() }
  const ANY_WORKSPACE = 'any'
  const ANY_PROJECT_ID = 'any'
  const ANY_TASK_ID = 'any'
})
