/**
 * Copyright 2016 Keymetrics Team. All rights reserved.
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file.
 */

var pmx             = require('pmx');
var elasticsearch   = require('elasticsearch');
var Probe           = pmx.probe();
var Stats           = require('./lib/stats');
var Actions         = require('./lib/actions');

pmx.initModule({

  pid              : pmx.resolvePidPaths(['/var/run/elasticsearch/elasticsearch.pid',
                                          '/var/run/elasticsearch.pid']),
  widget : {
    type             : 'generic',
    logo             : 'https://www.elastic.co/static/img/logo-elastic.png',

    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
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

  var WORKER_INTERVAL       = (conf.workerInterval * 1000) || 2000;
  var ELASTICSEARCH_URI     = conf.elasticsearchUri || process.env.PM2_ELASTICSEARCH_URI;

  var client = new elasticsearch.Client({
    host: ELASTICSEARCH_URI,
    log: 'error'
  });

  // register all workers
  var stats = new Stats(WORKER_INTERVAL, client);

  // init all probes
  stats.init();
  stats.update();

  // start all workers
  setInterval(stats.update.bind(stats), WORKER_INTERVAL);

  /** Register PMX actions */
  var actions = new Actions();
  actions.register();

});
