var pmx = require('pmx');
var request = require('request');

var Probe = pmx.probe();

var pending_task;
var request_indexe_avg;

setInterval(function () {
  request('http://localhost:9200/_cluster/pending_tasks', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      pending_task = result.tasks;
      pendingStatus.set(Object.keys(pending_task).length);
    }
  })

  request('http://localhost:9200/_stats/indexing', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      var indexing_total = result._all.primaries.indexing.index_total;
      var indexing_ms = result._all.primaries.indexing.index_time_in_millis;
      if (indexing_total != 0 && indexing_ms != 0) {
        var index_s = (indexing_ms/1000).toFixed(0);
        request_indexe_avg = (indexing_total/index_s).toFixed(0) + ' req/s';
      } else {
        request_indexe_avg = 0 + ' req/s';
      }
      requestIndexAvg.set(request_indexe_avg);
    }
  })

}, 2000)

var pendingStatus = Probe.metric({
  name: 'Pending cluster',
  value : function() { return 'N/A'; }
});

var requestIndexAvg = Probe.metric({
  name: 'Request index avg',
  value : function() { return 'N/A'; }
});