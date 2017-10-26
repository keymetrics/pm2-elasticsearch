/**
 * Copyright 2016 Keymetrics Team. All rights reserved.
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file.
 */

var pmx             = require('pmx');
var elasticsearch   = require('elasticsearch');
var Probe           = pmx.probe();
var stats           = require('./lib/stats');
var Actions         = require('./lib/actions');

pmx.initModule({

  pid              : pmx.resolvePidPaths(['/var/run/elasticsearch/elasticsearch.pid',
                                          '/var/run/elasticsearch.pid']),
  widget : {
    type             : 'generic',
    logo: 'https://www.elastic.co/static/img/logo-elastic.png',
    theme            : ['#39bdb1', '#1B2228', 'white', '#807C7C'],
    el : {
      probes  : true,
      actions : true
    },

    block : {
      issues  : true,
      meta : true,
      main_probes : ['Elastic status', 'Nodes', 'Shards', 'Indices', 'Documents', 'Store size']
    }
  }
}, function(err, conf) {
  var ELASTICSEARCH_URI     = conf.elasticsearchUri || process.env.PM2_ELASTICSEARCH_URI;

  var client = new elasticsearch.Client({
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

  /** Register PMX actions */
  var actions = new Actions(client)
  actions.register()
})
