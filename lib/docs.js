var pmx = require('pmx');
var request = require('request');
var numeral = require('numeral');

var Probe = pmx.probe();

var countDocs;

/**
  * Count all docs from all indexes
  */

setInterval(function () {

  request('http://localhost:9200/_all/_count', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      countDocs = result.count;
      if (countDocs > 1000)
        countDocs = numeral(countDocs).format('0.[0]a');
      allDocs.set(countDocs);
    }
  })
  
}, 2000)

var allDocs = Probe.metric({
  name  : 'Elastic Docs',
  value : function() { return 'N/A'; }
});