
var pmx = require('pmx');
var request = require('request');
var module_conf = pmx.getConf();

pmx.action('nodes info', function(rep) {
  request(module_conf.es_url + '/_nodes/process', function (error, response, body) {
    var result = JSON.parse(body);
    rep(result);
  });
});

pmx.action('cluster settings', function(rep) {
  request(module_conf.es_url + '/_cluster/settings', function (error, response, body) {
    var result = JSON.parse(body);
    rep(result);
  });
});

pmx.action('cluster health', function(rep) {
  request(module_conf.es_url + '/_cluster/health', function (error, response, body) {
    var result = JSON.parse(body);
    rep(result);
  });
});

var fs = require('fs');

pmx.action('es conf file', function(rep) {
  request(module_conf.es_url + '/_nodes/_local/settings', function (error, response, body) {
    var result = JSON.parse(body);

    var node = Object.keys(result.nodes)[0];

    var data = fs.readFileSync(result.nodes[node].settings.config).toString();
    var output = 'Content of ' + result.nodes[node].settings.config + ':\n\n';
    output += data.replace(/^[#;].*/gm, '').replace(/^\s*[\r\n]/gm, '');
    rep(output);
  });
});
