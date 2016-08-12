/**
 * Copyright 2016 Keymetrics Team. All rights reserved.
 * Use of this source code is governed by a license that
 * can be found in the LICENSE file.
 */

var pmx       = require('pmx');
var Probe     = pmx.probe();
var exec      = require('child_process').exec;

var ELASTIC_CLIENT  = undefined;

/** Constructor */
var Actions = function (client) {
  var self = this;

  ELASTIC_CLIENT = client;
}

/** Register all actions */
Actions.prototype.register = function () {

  /** Register restart action */
  pmx.action('restart', function(reply) {
    exec('/etc/init.d/elasticsearch restart', { shell: true } , function (err, out, error) {
      if (err) 
        return reply(err);
      else
        return reply(out);
    });
  });

  /** Register indices stats action */
  pmx.action('indices stats', function(reply) {
    ELASTIC_CLIENT.cat.indices({ bytes: 'k' }, function (err, data, code) {
      if (err) return console.error(err);

      return reply(data);
    })
  });

  /** Register indices stats action */
  pmx.action('shards stats', function(reply) {
    ELASTIC_CLIENT.cat.shards({}, function (err, data, code) {
      if (err) return console.error(err);

      return reply(data);
    })
  });

  /** Register cluster infos action */
  pmx.action('cluster infos', function(reply) {
    ELASTIC_CLIENT.nodes.info({}, function (err, data, code) {
      if (err) return console.error(err);

      return reply(data);
    })
  });

  /** Register cluster stats action */
  pmx.action('cluster stats', function(reply) {
    ELASTIC_CLIENT.nodes.stats({}, function (err, data, code) {
      if (err) return console.error(err);

      return reply(data);
    })
  });

  /** Register cluster health action */
  pmx.action('cluster health', function(reply) {
    ELASTIC_CLIENT.cluster.health({}, function (err, data, code) {
      if (err) return console.error(err);

      return reply(data);
    })
  });
}

module.exports = Actions;