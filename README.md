## Description

PM2 module to monitor a ElasticSearch cluster with Keymetrics

## Install

`pm2 install pm2-elasticsearch`

## Configure

- `workerInterval` (Defaults to `2` in secs) : You can control at which interval the worker is updating the stats (minimum is `1`)
- `elasticsearchUri` (Defaults to `http://localhost:9200/`): Set the URI to connect to your Elastic cluster (can be load from `PM2_ELASTICSEARCH_URI` env var)

#### How to set these values ?

 After having installed the module you have to type :
`pm2 set pm2-elasticsearch:<key> <value>`

e.g: 
- `pm2 set pm2-elasticsearch:workerInterval 5` (every 5 seconds)
- `pm2 set pm2-elasticsearch:elasticsearchUri https://user:password@host:port` (use simple auth to connect to the cluster)

## Uninstall

`pm2 uninstall pm2-elasticsearch`