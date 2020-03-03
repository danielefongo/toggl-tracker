import { afterEach, beforeEach, describe, it } from 'mocha'
import chai from 'chai'
import chaiSubset from 'chai-subset'
import sinon from 'sinon'
import moment from 'moment'

import { Printer } from '../src/printer'
import { TogglApi } from '../src/togglApi'
import { Toggl } from '../src/toggl'

chai.use(chaiSubset)

const { deepEqual, deepInclude, lengthOf } = chai.assert

describe('Toggl', () => {
  var mockPrinter

  var toggl
  const api = new TogglApi('123')

  beforeEach(async () => {
    mockPrinter = sinon.mock(Printer)
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

    const callArgument = stubbed.getCalls()[0].args[0]

    deepInclude(callArgument, {
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

    deepEqual(entries, [expectedEntry])
  })

  it('converts retrieved entry timestamps to moments', async () => {
    const expectedMoment = moment('2020-01-01')

    simulateEntries([aBasicEntry(1, ANY_WORKSPACE, '2020-01-01', '2020-01-01')])

    const entries = await toggl.getTimeEntries(ANY_WORKSPACE, moment(), moment())

    deepInclude(entries[0], {
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

    const entry = await toggl.getLastTimeEntry(ANY_WORKSPACE, moment(), moment())

    deepEqual(entry, expectedEntry)
  })

  it('extracts 0 holes between retrieved entries if they are consecutive', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-03')

    simulateEntries([
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-01', '2020-01-02'),
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-02', '2020-01-03')
    ])

    const holes = await toggl.getTimeEntriesHoles(ANY_WORKSPACE, startMoment, endMoment)

    lengthOf(holes, 0)
  })

  it('extracts holes between retrieved entries', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-04')

    simulateEntries([
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-01', '2020-01-02'),
      aBasicEntry(1, ANY_WORKSPACE, '2020-01-03', '2020-01-04')
    ])

    const holes = await toggl.getTimeEntriesHoles(ANY_WORKSPACE, startMoment, endMoment)

    lengthOf(holes, 1)
    deepInclude(holes[0], {
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

    lengthOf(holes, 2)
    deepInclude(holes[0], {
      start: moment('2020-01-01'),
      end: moment('2020-01-02')
    })
    deepInclude(holes[1], {
      start: moment('2020-01-03'),
      end: moment('2020-01-04')
    })
  })

  it('obtains all active projects and an empty project as first element', async () => {
    simulateProjects([PROJECT])

    const projects = await toggl.getActiveProjects(ANY_WORKSPACE)

    deepEqual(projects, [
      { id: undefined, name: 'NO PROJECT' },
      PROJECT
    ])
  })

  it('obtains all projects and an empty project as first element', async () => {
    simulateProjects([PROJECT])

    const projects = await toggl.getAllProjects(ANY_WORKSPACE)

    deepEqual(projects, [
      { id: undefined, name: 'NO PROJECT' },
      PROJECT
    ])
  })

  it('obtains all tasks and an empty task as last item', async () => {
    simulateTasks([TASK])

    const tasks = await toggl.getTasks(ANY_PROJECT_ID)

    deepEqual(tasks, [
      TASK,
      { id: undefined, name: '[no task]' }
    ])
  })

  it('obtains task if api returns a valid task', async () => {
    simulateTask(TASK)

    const task = await toggl.getTask(ANY_TASK_ID)

    deepEqual(task, TASK)
  })

  it('obtains empty task if api returns undefined', async () => {
    simulateTask(undefined)

    const task = await toggl.getTask(ANY_TASK_ID)

    deepEqual(task, { id: undefined, name: '[no task]' })
  })

  function aBasicEntry (id, workspace, startString = undefined, stopString = undefined) {
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
