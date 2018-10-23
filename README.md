## Description

PM2 module to monitor a ElasticSearch cluster with Keymetrics

## Install

`pm2 install pm2-elasticsearch`

## Configure

- `elasticsearchUri` (Defaults to `http://localhost:9200/`): Set the URI to connect to your Elastic cluster (can be load from `PM2_ELASTICSEARCH_URI` env var)

#### How to set these values ?

 After having installed the module you have to type :
`pm2 set pm2-elasticsearch:<key> <value>`

e.g: 
- `pm2 set pm2-elasticsearch:elasticsearchUri https://user:password@host:port` (use simple auth to connect to the cluster)

## Uninstall

`pm2 uninstall pm2-elasticsearch`