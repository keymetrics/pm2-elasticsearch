var pmx = require('pmx');
var request = require('request');

var Probe = pmx.probe();

var status;
var shards;
var indexes;
var size;
var segments;
var open_file_descriptors;

(function firstLaunch() {
    request('http://localhost:9200/_cluster/health', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        status = result.status;

        nodeNb.set(result.number_of_nodes);
        elasticStatus.set(status);
      }

    });

    request('http://localhost:9200/_cluster/stats?human', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        var size = result.indices.store.size;
        elasticStore.set(size);
      }

    });
    setTimeout(firstLaunch, 60000);
})();

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


var elasticStatus = Probe.metric({
  name: 'Elastic status',
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
  name: 'Store size',
  value : function() { return 'N/A'; }
});

var nodeNb = Probe.metric({
  name: 'Node number',
  value : function() { return 'N/A'; }
});

var elasticSegment = Probe.metric({
  name: 'Elastic segments',
  value : function() { return 'N/A'; }
});

var elasticFileDescriptors = Probe.metric({
  name: 'Open file descriptors',
  value : function() { return 'N/A'; }
});
