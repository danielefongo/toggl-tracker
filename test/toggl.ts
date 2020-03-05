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

chai.use(chaiSubset)

const { deepEqual, deepInclude, lengthOf } = chai.assert

describe('Toggl', () => {
  var mockPrinter: SinonMock

  var toggl: Toggl
  const api = new TogglApi('123')

  beforeEach(async () => {
    mockPrinter = sinon.mock(Printer)
    toggl = new Toggl(api, REFERRED_WORKSPACE)
  })

  afterEach(async () => {
    sinon.restore()
    mockPrinter.restore()
  })

  it('prints entry on successful entry creation', async () => {
    simulate('createTimeEntry', {})
    mockPrinter.expects('entry').once()

    await toggl.createTimeEntry(PROJECT, TASK, 'FOO', TIMESLOT)

    mockPrinter.verify()
  })

  it('converts moments to dates when creating entry', async () => {
    const stubbed = simulate('createTimeEntry', {})
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

    sinon.stub(api, 'getTimeEntries').resolves([
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
    const expectedEntry = new Entry(startAndStopMoment, startAndStopMoment, "", 1, undefined, undefined)

    simulate('getTimeEntries', [togglEntry])

    const entries = await toggl.getTimeEntries(moment(), moment())

    deepEqual(entries[0], expectedEntry)
  })

  it('obtains last time entry', async () => {
    const togglEntry = aTogglEntry(1, REFERRED_WORKSPACE)

    simulate('getTimeEntries', [
      aTogglEntry(2, REFERRED_WORKSPACE),
      togglEntry
    ])

    const entry = await toggl.getLastTimeEntry(moment(), moment())

    deepInclude(entry, { id: 1 })
  })

  it('extracts 0 holes between retrieved entries if they are consecutive', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-03')

    simulate('getTimeEntries', [
      aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-01', '2020-01-02'),
      aTogglEntry(1, REFERRED_WORKSPACE, '2020-01-02', '2020-01-03')
    ])

    const holes = await toggl.getTimeEntriesHoles(startMoment, endMoment)

    lengthOf(holes, 0)
  })

  it('extracts holes between retrieved entries', async () => {
    const startMoment = moment('2020-01-01')
    const endMoment = moment('2020-01-04')

    simulate('getTimeEntries', [
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

    simulate('getTimeEntries', [
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
    simulate('getActiveProjects', [TOGGL_PROJECT])

    const projects = await toggl.getActiveProjects()

    deepEqual(projects, [EMPTY_PROJECT, PROJECT])
  })

  it('obtains all projects and an empty project as first element', async () => {
    simulate('getAllProjects', [TOGGL_PROJECT])

    const projects = await toggl.getAllProjects()

    deepEqual(projects, [EMPTY_PROJECT, PROJECT])
  })

  it('obtains project', async () => {
    simulate('getProject', TOGGL_PROJECT)

    const project = await toggl.getProject(123)

    deepEqual(project, PROJECT)
  })

  it('obtains empty project if id is undefined', async () => {
    const project = await toggl.getProject(undefined)

    deepEqual(project, EMPTY_PROJECT)
  })

  it('obtains all tasks and an empty task as last item', async () => {
    simulate('getTasks', [TOGGL_TASK])

    const tasks = await toggl.getTasks(ANY_PROJECT_ID)

    deepEqual(tasks, [TASK, EMPTY_TASK])
  })

  it('obtains task if api returns a valid task', async () => {
    simulate('getTask', TASK)

    const task = await toggl.getTask(ANY_TASK_ID)

    deepEqual(task, TASK)
  })

  it('obtains empty task if api returns undefined', async () => {
    simulate('getTask', undefined)

    const task = await toggl.getTask(ANY_TASK_ID)

    deepEqual(task, EMPTY_TASK)
  })

  it('obtains empty task if id is undefined', async () => {
    const task = await toggl.getTask(undefined)

    deepEqual(task, EMPTY_TASK)
  })

  function aTogglEntry (id: number, workspace: string, startString?: string, stopString?: string) {
    return {
      id,
      start: startString,
      stop: stopString,
      wid: workspace
    }
  }

  function simulate (method, resolved) {
    return sinon.stub(api, method).resolves(resolved)
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
