const lodash = require('lodash')
const PriceRangeRunner = __src('runners/price_range_runner')
const defaultAction = __src('runners/price_range_runner/actions/default')
const createListRunner = require('./list_runner')
const helpers = require('./helpers')

const PRICE_GEARS = __src('helpers/ua/constants/price_gears')
const PRICE_MAX = 9000000
const RESULTS_MIN = 1000
const RESULTS_MAX = 10000

module.exports = createPriceRangeRunner

function createPriceRangeRunner({ link }) {
  const price = {
    gears: PRICE_GEARS,
    max: PRICE_MAX
  }

  const runner = new PriceRangeRunner({
    link,
    price,
    fetchListInfo,
    listAction,
    listRunner
  })

  return runner
}

async function fetchListInfo({ link, price, proxy }) {
  const url = helpers.buildUrl({ link, price })
  const jar = proxy.jar(helpers.buildCookies())

  const data = await proxy.request(lodash.assign({
    jar,
    json: true
  }, url))

  const { results, pages } = helpers.countListResults(data)

  return { results, pages, url }
}

async function listAction({ listInfo, lastListInfo = null, price }) {
  return defaultAction({
    listInfo,
    lastListInfo,
    price,
    minResults: RESULTS_MIN,
    maxResults: RESULTS_MAX
  })
}

async function listRunner({ link, price, listInfo }) {
  const runner = await createListRunner({
    link,
    price,
    listInfo
  })

  return runner
}
