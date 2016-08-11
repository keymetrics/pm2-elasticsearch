/**
 * Copyright 2016 Keymetrics Team. All rights reserved.
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file.
 */

var pmx = require('pmx');
var Probe = pmx.probe();

var WORKER_INTERVAL = undefined;
var ELASTIC_CLIENT  = undefined;

/** Constructor */
var Stats = function (workerInterval, client) {
  var self = this;

  WORKER_INTERVAL = workerInterval;
  ELASTIC_CLIENT = client;
  this.probes = {};
}

Stats.prototype.probes = {};

/** Init all probes */
Stats.prototype.init = function () {

  this.probes.unassignedShard = Probe.metric({
    name: 'Unass. shards',
    alert : {
      mode  : 'threshold-avg',
      value : 100,
      msg   : 'Too many unassigned shards'
    },
    value : function() { return 'N/A'; }
  });

  this.probes.relocatShard = Probe.metric({
    name: 'Reloc. shards',
    value : function() { return 'N/A'; }
  });

  this.probes.elasticShards = Probe.metric({
    name: 'Shards',
    value : function() { return 'N/A'; }
  });

  this.probes.activeShards = Probe.metric({
    name: 'Active shards',
    value : function() { return 'N/A'; }
  });

  this.probes.elasticIndexes = Probe.metric({
    name: 'Indices',
    value : function() { return 'N/A'; }
  });

  this.probes.elasticStore = Probe.metric({
    name: 'Store size',
    value : function() { return 'N/A'; }
  });

  this.probes.elasticSegment = Probe.metric({
    name: 'Elastic segments',
    value : function() { return 'N/A'; }
  });

  this.probes.jvmThread = Probe.metric({
    name: 'Threads count',
    value : function() { return 'N/A'; }
  });

  this.probes.jvmUptime = Probe.metric({
    name: 'Uptime',
    value : function() { return 'N/A'; }
  });

  this.probes.nodeNb = Probe.metric({
    name: 'Nodes',
    value : function() { return 'N/A'; }
  });

  this.probes.elasticVersion = Probe.metric({
    name: 'Elastic version',
    value : function() { return 'N/A'; }
  });

  this.probes.jvmVersion = Probe.metric({
    name: 'JVM Version',
    value : function() { return 'N/A'; }
  });

  this.probes.clusterName = Probe.metric({
    name: 'Cluster',
    value : function() { return 'N/A'; }
  });

  this.probes.elasticStatus = Probe.metric({
    name: 'Elastic status',
    value : function() { return 'N/A'; }
  });

  this.probes.docsNb = Probe.metric({
    name: 'Documents',
    value : function() { return 'N/A'; }
  });
}

/** Update all probes */
Stats.prototype.update = function () {
  var instance = this;

  ELASTIC_CLIENT.cluster.stats({ human: true }, function (err, data, code) {
    if (err) return console.error(err);

    // general metrics
    instance.probes.clusterName.set(data.cluster_name);
    instance.probes.nodeNb.set(data.nodes.count.total);
    instance.probes.elasticVersion.set(data.nodes.versions[0]);
    instance.probes.elasticStore.set(data.indices.store.size);
    
    // jvm related metrics
    if (data.nodes.jvm) {
      instance.probes.jvmUptime.set(data.nodes.jvm.max_uptime);
      instance.probes.jvmVersion.set(data.nodes.jvm.versions.version);
      instance.probes.jvmThread.set(data.nodes.jvm.threads);
    }

    // elastic metrics
    instance.probes.elasticIndexes.set(data.indices.count);
    instance.probes.elasticSegment.set(data.indices.segments.count);
    instance.probes.docsNb.set(data.indices.docs.count);
  })

  ELASTIC_CLIENT.cluster.health({}, function (err, data, code) {
    if (err) return console.error(err);
    
    // update health status and shards
    instance.probes.elasticStatus.set(data.status);
    instance.probes.relocatShard.set(data.relocating_shards);
    instance.probes.activeShards.set(data.active_shards);
    instance.probes.unassignedShard.set(data.unassigned_shards);
    instance.probes.elasticShards.set(data.active_shards + data.relocating_shards +
                data.initializing_shards + data.unassigned_shards);
  })
}

module.exports = Stats;