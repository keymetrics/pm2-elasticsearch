var pmx = require('pmx');
var request = require('request');

var Probe = pmx.probe();

var status;
var version;
var shards;
var indexes;
var size;
var segments;
var jvm_version;
var open_file_descriptors;

(function firstLaunch() {
    request('http://localhost:9200/_cluster/health', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      status = result.status;
      elasticStatus.set(status);
    }
  });
    setTimeout(firstLaunch, 60000);
})();

request('http://localhost:9200/_cluster/stats', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    version = result.nodes.versions[0];
    elasticVersion.set(version);
  }
});

request('http://localhost:9200/_stats/shards', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    shards = result._shards.total;
    elasticShards.set(shards);
  }

});

request('http://localhost:9200/_cluster/stats', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    indexes = result.indices.count;
    elasticIndexes.set(indexes);
  }

});

request('http://localhost:9200/_cluster/stats?human', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    var sizeMb = result.indices.store.size;
    size = sizeMb.match(/([\d\W]*)/)[1]+'MB';
    elasticStore.set(size);
  }

});

setInterval(function () {
  
  request('http://localhost:9200/_cluster/stats', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      segments = result.indices.segments.count;
      elasticSegment.set(segments);
    }

  });

  request('http://localhost:9200/_cluster/stats', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      open_file_descriptors = result.nodes.process.open_file_descriptors.avg;
      elasticFileDescriptors.set(open_file_descriptors);
    }

  });

}, 2000)


request('http://localhost:9200/_cluster/stats', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    jvm_version = result.nodes.jvm.versions[0].version;
    elasticJvm.set(jvm_version);
  }

});


var elasticStatus = Probe.metric({
  name: 'Elastic status',
  value : function() { return 'N/A'; }
});

var elasticVersion = Probe.metric({
  name: 'Elastic version',
  value : function() { return 'N/A'; }
});

var elasticShards = Probe.metric({
  name: 'Total shards',
  value : function() { return 'N/A'; }
});

var elasticIndexes = Probe.metric({
  name: 'Indexes created',
  value : function() { return 'N/A'; }
});

var elasticStore = Probe.metric({
  name: 'Elastic size',
  value : function() { return 'N/A'; }
});

var elasticSegment = Probe.metric({
  name: 'Elastic segments',
  value : function() { return 'N/A'; }
});

var elasticJvm = Probe.metric({
  name: 'JVM Version',
  value : function() { return 'N/A'; }
});

var elasticFileDescriptors = Probe.metric({
  name: 'Open file descriptors',
  value : function() { return 'N/A'; }
});