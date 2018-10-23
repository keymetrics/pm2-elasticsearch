/**
 * Copyright 2016 Keymetrics Team. All rights reserved.
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file.
 */

const io = require('@pm2/io')
const async = require('async')
const getObject = require('object-path').get
const metrics = require('./metrics.json')

const values = new Map()

/** Init all probes */
exports.init = function () {
  metrics.forEach(function (metric) {
    // instanciate each probe
    metric.probe = io.metric({
      name: metric.name,
      unit: metric.unit || ''
    })
  })
}

/** Update all probes */
exports.update = function (esClient) {
  // query cluster and node stats
  async.parallel([
    function (next) {
      return esClient.cluster.stats({
        human: true
      }, next)
    },
    function (next) {
      return esClient.nodes.stats({
        human: true,
        nodeId: '_local'
      }, next)
    },
    function (next) {
      return esClient.cluster.health({
        human: true
      }, next)
    }
  ], (err, data) => {
    if (err) {
      console.error(err)
      return io.notifyError(err)
    }
    // lets update metrics
    for (let i = 0, max = metrics.length; i < max; i++) {
      var metric = metrics[i]
      let stats = {}

      // depending on the stats source
      switch (metric.from) {
        case 'cluster': {
          stats = data[0][0]
          break
        }
        case 'cluster_health': {
          stats = data[2][0]
          break
        }
        case 'node': {
          var nodes = Object.keys(data[1][0].nodes)
          stats = data[1][0].nodes[nodes[0]]
          break
        }
      }

      let value = getObject(stats, metric.path)
      if (typeof value === 'undefined') continue

      if (metric.compareToLastValue) {
        if (typeof metric.counter !== 'number') {
          metric.counter = 0
          values.set(metric.path, value)
        }
        // increment the counter
        metric.counter++
        // when we are arrive at one minute, compare & update
        if (metric.counter === 60) {
          metric.counter = 0
          const old = values.get(metric.path) + 0
          values.set(metric.path, value)
          // continue to next metric if old value isnt found (must be the first run)
          if (old === undefined) continue
          metric.probe.set(value - old)
        }
      } else if (metric.divide_by) {
        let divideBy = getObject(stats, metric.divide_by)
        if (typeof divideBy === 'undefined') continue
        if (divideBy === '0' || divideBy === 0) continue

        metric.probe.set(parseFloat(value / divideBy * (metric.multiply_by || 1)).toFixed(2))
      } else {
        metric.probe.set(value)
      }
    }
  })
}
