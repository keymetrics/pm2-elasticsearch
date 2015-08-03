var fs = require('fs');

var data = fs.readFileSync('/etc/elasticsearch/elasticsearch.yml').toString();

console.log(data.replace(/^[#;].*/gm, '').replace(/^\s*[\r\n]/gm, ''));
