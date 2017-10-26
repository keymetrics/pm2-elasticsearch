/**
 * Copyright 2016 Keymetrics Team. All rights reserved.
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file.
 */

var pmx = require('pmx')
var Probe = pmx.probe()
var async = require('async')
var getObject = require('object-path').get
var metrics = require('./metrics.json')

var values = new Map()

/** Init all probes */
exports.init = function () {
  metrics.forEach(function (metric) {
    // instanciate each probe
    metric.probe = Probe.metric({
      name: metric.name,
      unit: metric.unit || '',
      value: function () { return 'N/A' }
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
    }
  ], (err, data) => {
    if (err) {
      console.error(err)
      return pmx.notify(err)
    }
    // lets update metrics
    for (let i = 0, max = metrics.length; i < max; i++) {
      var metric = metrics[i]
      var stats = metric.from === 'cluster' ? data[0][0] : data[1][0]

      // in the case of the node, we need to get the actual node stats
      // and since elasticsearch send a map style document we need to trick
      if (metric.from === 'node') {
        var nodes = Object.keys(stats.nodes)
        stats = stats.nodes[nodes[0]]
      }
      let value = getObject(stats, metric.path)
      if (typeof value === 'undefined') continue

      if (metric.compareToLastValue) {
        var old = values.get(metric.path) + 0
        values.set(metric.path, value)
        // continue to next metric if old value isnt found (must be the first run)
        if (!old) continue
        var current = value - old
        // if the metric dont need to be devined, compute it and continue
        metric.probe.set(current)
      } else if (metric.divide_by) {
        let divideBy = getObject(stats, metric.divide_by)
        if (typeof divideBy === 'undefined') continue
        if (divideBy === '0' || divideBy === 0) continue

        metric.probe.set(parseFloat(value / divideBy).toFixed(2))
      } else {
        metric.probe.set(value)
      }
    }
  })
}
