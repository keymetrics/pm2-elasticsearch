'use strict'

const io = require('@pm2/io')
const elasticsearch = require('elasticsearch')
const stats = require('./lib/stats')
const Actions = require('./lib/actions')

io.initModule({
  widget: {
    type: 'generic',
    logo: 'https://www.elastic.co/static/img/logo-elastic.png',
    theme: ['#39bdb1', '#1B2228', 'white', '#807C7C'],
    el: {
      probes: true,
      actions: true
    },

    block: {
      issues: true,
      meta: true,
      main_probes: ['Elastic status', 'Nodes', 'Shards', 'Indices', 'Documents', 'Store size']
    }
  }
}, function (err, conf) {
  if (err) {
    console.error(err)
    return process.exit(1)
  }
  const ELASTICSEARCH_URI = conf.elasticsearchUri || process.env.PM2_ELASTICSEARCH_URI

  const client = new elasticsearch.Client({
    host: ELASTICSEARCH_URI,
    log: 'error'
  })

  // init all probes
  stats.init()
  stats.update(client)

  // start all workers
  setInterval(function () {
    return stats.update(client)
  }, 1000)

  // Register PMX actions
  const actions = new Actions(client)
  actions.register()
})
