var pmx = require('pmx');

var module_conf = pmx.getConf();

var request = require('request');

var Probe = pmx.probe();

var status;
var shards;
var indexes;
var size;
var segments;
var open_file_descriptors;


var jvmThread = Probe.metric({
  name: 'Threads count',
  value : function() { return 'N/A'; }
});

var httpOpen = Probe.metric({
  name: 'Open HTTP',
  value : function() { return 'N/A'; }
});

var indexTime = Probe.metric({
  name: 'Indexing time (ms)',
  value : function() { return 'N/A'; }
});

var gcTime = Probe.metric({
  name: 'GC time',
  value : function() { return 'N/A'; }
});

setInterval(function() {
  request(module_conf.es_url + '/_nodes/_local/stats', function (error, response, body) {
    var result = JSON.parse(body);

    var node = Object.keys(result.nodes)[0];
    var curr_node = result.nodes[node];

    jvmThread.set(curr_node.jvm.threads.count);
    httpOpen.set(curr_node.http.current_open);
    indexTime.set(curr_node.indices.indexing.index_time_in_millis);
    gcTime.set(curr_node.jvm.gc.collectors.young.collection_time_in_millis);
  });
}, 1000);



(function firstLaunch() {
  request(module_conf.es_url + '/_cluster/health', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      status = result.status;

      nodeNb.set(result.number_of_nodes);
      elasticStatus.set(status);
    }

  });

  request(module_conf.es_url + '/_cluster/stats?human', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      var size = result.indices.store.size;
      elasticStore.set(size);
    }

  });
  setTimeout(firstLaunch, 60000);
})();

request(module_conf.es_url + '/_stats/shards', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    shards = result._shards.total;
    elasticShards.set(shards);
  }

});

request(module_conf.es_url + '/_cluster/stats', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var result = JSON.parse(body);
    indexes = result.indices.count;
    elasticIndexes.set(indexes);
  }

});



setInterval(function () {

  request(module_conf.es_url + '/_cluster/stats', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      segments = result.indices.segments.count;
      elasticSegment.set(segments);
    }

  });

  request(module_conf.es_url + '/_cluster/stats', function (error, response, body) {
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
