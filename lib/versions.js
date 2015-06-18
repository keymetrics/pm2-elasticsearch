var pmx = require('pmx');
var request = require('request');

var Probe = pmx.probe();

var version;
var jvm_version;

request('http://localhost:9200/_cluster/stats', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    version = result.nodes.versions[0];
    elasticVersion.set(version);
  }
});

request('http://localhost:9200/_cluster/stats', function (error, response, body) {
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