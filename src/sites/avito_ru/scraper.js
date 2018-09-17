const lodash = require('lodash')
const LinksRunner = require('./../../runners/links_runner')
const ProxyManager = require('./../../managers/proxy')
const createPriceRangeRunner = require('./price_range_runner')
const createAdRunner = require('./ad_runner')
const helpers = require('./helpers')

module.exports = {
  siteRunner: createSiteRunner,
  adRunner: createAdRunner,
  proxy: {
    delay: [10, 20]
  }
}

async function createSiteRunner(link) {
  const runner = new LinksRunner({
    link,
    fetchLinks,
    linkRunner: createPriceRangeRunner
  })

  return runner
}

async function fetchLinks(...args) {
  const categories = await getCategoryLinks('/rossiya', ...args)

  const tasks = categories.map(link => getCategoryLinks(link, ...args))

  const subcategories = await Promise.all(tasks)

  const links = lodash.flatten(subcategories).map(link => ({
    url: link
  }))

  return links
}

function getCategoryLinks(url, {
  logger
}) {
  return ProxyManager.pool('list').session({
    async run(proxy) {
      const html = await proxy.request(helpers.buildCategoryUrl(url))

      return helpers.getCategoryLinks(html)
    },
    onError(error) {
      logger.error({
        err: error,
        url
      }, 'unable to get links')
    }
  })
}
