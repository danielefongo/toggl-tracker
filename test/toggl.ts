import { afterEach, beforeEach, describe, it } from 'mocha'
import chai from 'chai'
import chaiSubset from 'chai-subset'
import sinon, { SinonMock } from 'sinon'
import moment from 'moment'

import { Printer } from '../src/printer'
import { TogglApi } from '../src/togglApi'
import { Toggl } from '../src/toggl'
import { TimeSlot } from '../src/model/timeSlot'
import { Project } from '../src/model/project'
import { Task } from '../src/model/task'
import { Entry } from '../src/model/entry'
import { ReportsApi } from '../src/reportsApi'
import { Summary } from '../src/model/summary'
import { Client } from '../src/model/client'

chai.use(chaiSubset)

const { deepEqual, deepInclude, lengthOf } = chai.assert

describe('Toggl', () => {
  var mockPrinter: SinonMock

  var toggl: Toggl
  const togglApi = new TogglApi('123')
  const reportsApi = new ReportsApi('123')

  beforeEach(async () => {
    mockPrinter = sinon.mock(Printer)
    toggl = new Toggl(togglApi, reportsApi, REFERRED_WORKSPACE)
  })

  afterEach(async () => {
    sinon.restore()
    mockPrinter.restore()
  })

  it('prints entry on successful entry creation', async () => {
    simulateToggl('createTimeEntry', {})
    mockPrinter.expects('entry').once()

    await toggl.createTimeEntry(PROJECT, TASK, 'FOO', TIMESLOT)

    mockPrinter.verify()
  })

  it('converts moments to dates when creating entry', async () => {
    const stubbed = simulateToggl('createTimeEntry', {})
    mockPrinter.expects('entry') // TODO remove this when passing printer as dependency

    await toggl.createTimeEntry(PROJECT, TASK, 'FOO', TIMESLOT)

    const callArgument = stubbed.getCalls()[0].args[0]

    deepInclude(callArgument, {
      start: TIMESLOT.start.toDate(),
      stop: TIMESLOT.end.toDate()
    })
  })

  it('filters retrieved time entries', async () => {
    const togglEntry = aTogglEntry(1, REFERRED_WORKSPACE)

    sinon.stub(togglApi, 'getTimeEntries').resolves([
      togglEntry,
      aTogglEntry(2, ANOTHER_WORKSPACE)
    ])

    const entries = await toggl.getTimeEntries(moment(), moment())

    lengthOf(entries, 1)
    deepInclude(entries[0], { id: 1 })
  })

  it('converts toggl entries to proper entries', async () => {
    const startAndStopMoment = moment('2020-01-01')

    const togglEntry = aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-01', '2020-01-01')
    const expectedEntry = new Entry(startAndStopMoment, startAndStopMoment, '', 1, undefined, undefined)

    simulateToggl('getTimeEntries', [togglEntry])

    const entries = await toggl.getTimeEntries(moment(), moment())

    deepEqual(entries[0], expectedEntry)
  })

  it('obtains last time entry', async () => {
    const togglEntry = aTogglEntry(1, REFERRED_WORKSPACE)

    simulateToggl('getTimeEntries', [
      aTogglEntry(2, REFERRED_WORKSPACE),
      togglEntry
    ])

    const entry = await toggl.getLastTimeEntry(moment(), moment())

    deepInclude(entry, { id: 1 })
  })

  it('extracts 0 holes between retrieved entries if they are consecutive', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-03')

    simulateToggl('getTimeEntries', [
      aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-01', '2020-01-02'),
      aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-02', '2020-01-03')
    ])

    const holes = await toggl.getTimeEntriesHoles(startMoment, endMoment)

    lengthOf(holes, 0)
  })

  it('extracts holes between retrieved entries', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-04')

    simulateToggl('getTimeEntries', [
      aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-01', '2020-01-02'),
      aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-03', '2020-01-04')
    ])

    const holes = await toggl.getTimeEntriesHoles(startMoment, endMoment)

    lengthOf(holes, 1)
    deepInclude(holes[0], {
      start: moment('2020-01-02'),
      end: moment('2020-01-03')
    })
  })

  it('extracts holes outside retrieved entries', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-04')

    simulateToggl('getTimeEntries', [
      aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-02', '2020-01-03')
    ])

    const holes = await toggl.getTimeEntriesHoles(startMoment, endMoment)

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
    simulateToggl('getActiveProjects', [TOGGL_PROJECT])

    const projects = await toggl.getActiveProjects()

    deepEqual(projects, [EMPTY_PROJECT, PROJECT])
  })

  it('obtains all projects and an empty project as first element', async () => {
    simulateToggl('getAllProjects', [TOGGL_PROJECT])

    const projects = await toggl.getAllProjects()

    deepEqual(projects, [EMPTY_PROJECT, PROJECT])
  })

  it('obtains project', async () => {
    simulateToggl('getProject', TOGGL_PROJECT)

    const project = await toggl.getProject(123)

    deepEqual(project, PROJECT)
  })

  it('obtains empty project if id is undefined', async () => {
    const project = await toggl.getProject(undefined)

    deepEqual(project, EMPTY_PROJECT)
  })

  it('obtains all tasks and an empty task as last item', async () => {
    simulateToggl('getTasks', [TOGGL_TASK])

    const tasks = await toggl.getTasks(ANY_PROJECT_ID)

    deepEqual(tasks, [TASK, EMPTY_TASK])
  })

  it('obtains task if togglApi returns a valid task', async () => {
    simulateToggl('getTask', TASK)

    const task = await toggl.getTask(ANY_TASK_ID)

    deepEqual(task, TASK)
  })

  it('obtains empty task if togglApi returns undefined', async () => {
    simulateToggl('getTask', undefined)

    const task = await toggl.getTask(ANY_TASK_ID)

    deepEqual(task, EMPTY_TASK)
  })

  it('obtains empty task if id is undefined', async () => {
    const task = await toggl.getTask(undefined)

    deepEqual(task, EMPTY_TASK)
  })

  it('obtains reports', async () => {
    simulateReports('getSummary', [
      {
        title: { project: 'project1', client: 'client1' },
        time: 1000
      },
      {
        title: { project: 'project2', client: 'client2' },
        time: 2000
      }
    ])

    const reports = await toggl.getSummary(moment(), moment())

    deepEqual(reports, [
      new Summary(new Client('client1'), new Project('project1'), 1),
      new Summary(new Client('client2'), new Project('project2'), 2)
    ])
  })

  function aTogglEntry (id: number, workspace: string, startString?: string, stopString?: string) {
    return {
      id,
      start: startString,
      stop: stopString,
      wid: workspace
    }
  }

  function simulateReports (method, resolved) {
    return sinon.stub(reportsApi, method).resolves(resolved)
  }

  function simulateToggl (method, resolved) {
    return sinon.stub(togglApi, method).resolves(resolved)
  }

  const TOGGL_PROJECT = { name: 'projectName', id: 123, billable: true, cid: 123 }
  const PROJECT = new Project('projectName', 123, true, 123)
  const EMPTY_PROJECT = new Project()

  const TOGGL_TASK = { name: 'task', id: 123 }
  const TASK = new Task('task', 123)
  const EMPTY_TASK = new Task()

  const TIMESLOT = new TimeSlot(moment(), moment())

  const REFERRED_WORKSPACE = 'workspace'
  const ANOTHER_WORKSPACE = 'another workspace'

  const ANY_PROJECT_ID = 123
  const ANY_TASK_ID = 123
})
