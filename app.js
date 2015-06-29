var stats = require('./lib/stats'),
    docs = require('./lib/docs'),
    tasks = require('./lib/tasks'),
    versions = require('./lib/versions'),
    request = require('request'),
    pmx = require('pmx'),
    pm2 = require('pm2'),
    shelljs = require('shelljs'),
    fs      = require('fs'),
    path    = require('path');

request('http://localhost:9200/', function (error, response, body) {
  if (error) {
    var err = new Error('Problem with your server Elasticsearch');
    pmx.notify(err);
    throw err;
  }
});

var conf = pmx.initModule({

  pid              : pmx.resolvePidPaths(['/var/run/elasticsearch/elasticsearch.pid',
                                          '/var/run/elasticsearch.pid']),

  widget : {
    type             : 'generic',
    logo             : 'https://www.elastic.co/static/img/logo-elastic.png',

    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
    theme            : ['#33CACC', '#39BDB1', 'white', 'white'],

    el : {
      probes  : true,
      actions : true
    },

    block : {
      actions : true,
      issues  : true,
      meta : false,
      main_probes : ['Elastic status', 'Total shards', 'Indexes created', 'Elastic Docs', 'Store size', 'Index avg']
    }

    // Status
    // Green / Yellow / Red
  }
});

pmx.action('restart', function(reply) {
  var child = shelljs.exec('/etc/init.d/elasticsearch restart');
  return reply(child);
});