import { describe, it } from 'mocha'
import chai from 'chai'
import chaiSubset from 'chai-subset'
import moment from 'moment'
import { ReportsApi } from '../src/reportsApi'

chai.use(chaiSubset)

const { lengthOf } = chai.assert
const token = process.env.TOGGL_TEST_TOKEN
const workspace = process.env.TOGGL_TEST_WORKSPACE

if (token === undefined || workspace === undefined) {
  throw new Error('use environment properties: TOGGL_TEST_TOKEN, TOGGL_TEST_WORKSPACE')
}

describe('Reports Api Integration', () => {
  const aMoment = moment()

  var reportsApi: ReportsApi

  it('does not break', async () => {
    reportsApi = new ReportsApi(token)

    const report = await reportsApi.getSummary(workspace, aMoment.format(), aMoment.format())

    lengthOf(report, 0)
  }).timeout(1000)
})
