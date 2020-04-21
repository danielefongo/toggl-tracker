import { describe, it } from 'mocha'
import sinon from 'sinon'
import chai from 'chai'

import { Actions } from '../src/actions'
import { Loader } from '../src/loader'
import { Files } from '../src/files'
import { Git } from '../src/git'

const { deepEqual, lengthOf } = chai.assert
const loader = new Loader()
const files = new Files()
const git = new Git()
const actionFolder = 'root/'

describe('Actions', () => {
  let sandbox
  let findStub
  let existsStub
  let deleteStub
  let loaderStub
  let gitStub
  let actions

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    sandbox.stub(console, 'log')
    findStub = sandbox.stub(files, 'find')
    existsStub = sandbox.stub(files, 'exists')
    deleteStub = sandbox.stub(files, 'delete')
    loaderStub = sandbox.stub(loader, 'require')
    gitStub = sandbox.stub(git, 'clone')

    actions = new Actions(files, git, loader, actionFolder, undefined, undefined, undefined, undefined)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('load unique valid action using repo name', () => {
    findStub.returns(['/user/repo/action.js'])
    loaderStub.returns(fakeScript())

    actions.run('repo')

    deepEqual(loaderStub.firstCall.args[0], 'root/user/repo/action.js')
  })

  it('load unique valid action using user and repo', () => {
    findStub.returns(['/user/repo/action.js'])
    loaderStub.returns(fakeScript())

    actions.run('user/repo')

    deepEqual(loaderStub.firstCall.args[0], 'root/user/repo/action.js')
  })

  it('do not run invalid action', () => {
    findStub.returns(['/user/repo/action.js'])
    loaderStub.returns(fakeScript())

    actions.run('invalid')

    lengthOf(loaderStub.getCalls(), 0)
  })

  it('run valid action', (done) => {
    findStub.returns(['/user/repo/action.js'])
    loaderStub.returns(fakeScript(done))

    actions.run('repo')
  })

  it('do not run ambiguous action', () => {
    findStub.returns(['/user1/repo/action.js', '/user2/repo/action.js'])
    loaderStub.returns(fakeScript())

    actions.run('repo')

    lengthOf(loaderStub.getCalls(), 0)
  })

  it('clone new action', () => {
    existsStub.returns(false)
    gitStub.returns(new Promise(() => {}))

    actions.install('user/repo')

    deepEqual(existsStub.firstCall.args, [
      actionFolder + "user/repo/action.js"
    ])
    deepEqual(gitStub.firstCall.args, [
      "https://github.com/user/repo",
      actionFolder + "user/repo"
    ])
  })

  it('do not clone existing action', () => {
    existsStub.returns(true)

    actions.install('user/repo')

    lengthOf(gitStub.getCalls(), 0)
  })

  it('do not install invalid action', (done) => {
    existsStub.returns(false)
    gitStub.returns(new Promise((resolve) => {resolve()}))

    actions.install('user/repo')

    setTimeout(() => {
      deepEqual(deleteStub.firstCall.args, [
        actionFolder + "user/repo"
      ])
      done()
    }, 50)
  })

  it('do not install malformed action', (done) => {
    existsStub.returns(false)
    gitStub.returns(new Promise((resolve) => {resolve()}))
    loaderStub.throws()

    actions.install('user/repo')

    setTimeout(() => {
      deepEqual(deleteStub.firstCall.args, [
        actionFolder + "user/repo"
      ])
      done()
    }, 50)
  })

  it('install valid action', (done) => {
    existsStub.onCall(0).returns(false)
    existsStub.onCall(1).returns(true)
    gitStub.returns(new Promise((resolve) => {resolve()}))
    loaderStub.returns(fakeScript())

    actions.install('user/repo')

    setTimeout(() => {
      lengthOf(deleteStub.getCalls(), 0)
      done()
    }, 50)
  })
})

function fakeScript(callback = () => {}) {
  return function() {
    this.run = async() => { callback() }
    this.help = () => {}
  }
}