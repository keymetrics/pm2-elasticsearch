var pmx = require('pmx');

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
      main_probes : ['Elastic status', 'Total shards', 'Indexes created', 'Elastic Docs', 'Store size', 'Index avg']
    }

    // Status
    // Green / Yellow / Red
  }
}, function(err, conf) {
  var stats = require('./lib/stats'),
      docs = require('./lib/docs'),
      tasks = require('./lib/tasks'),
      versions = require('./lib/versions'),
      request = require('request'),
      shelljs = require('shelljs'),
      fs      = require('fs'),
      path    = require('path'),
      actions = require('./lib/actions'),
      Probe = pmx.probe();

  global.errorRate = Probe.meter({
    name : 'Error rate'
  });

  request(conf.es_url, function (error, response, body) {
    if (error) {
      errorRate.mark();
      throw new Error('Cannot connect to ' + conf.es_url + ' elastic node');
    }
  });

  request(conf.es_url + '/_nodes/_local/settings', function (error, response, body) {
    var result = JSON.parse(body);

    var node = Object.keys(result.nodes)[0];
    esName.set(result.nodes[node].name);
  });

  var esName = Probe.metric({
    name: 'Node name',
    value : function() { return 'N/A'; }
  });

  pmx.action('restart', function(reply) {
    var child = shelljs.exec('/etc/init.d/elasticsearch restart');
    return reply(child);
  });

});
