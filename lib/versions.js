var pmx = require('pmx');
var request = require('request');
var module_conf = pmx.getConf();
var Probe = pmx.probe();

var version;
var jvm_version;

request(module_conf.es_url + '/_cluster/stats', function (error, response, body) {
  if (error) global.errorRate.mark();

  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    version = result.nodes.versions[0];
    elasticVersion.set(version);
  }
});

request(module_conf.es_url + '/_cluster/stats', function (error, response, body) {
  if (error) global.errorRate.mark();

  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    jvm_version = result.nodes.jvm.versions[0].version;
    elasticJvm.set(jvm_version);
  }

});

var elasticVersion = Probe.metric({
  name: 'Elastic version',
  value : function() { return 'N/A'; }
});

var elasticJvm = Probe.metric({
  name: 'JVM Version',
  value : function() { return 'N/A'; }
});
