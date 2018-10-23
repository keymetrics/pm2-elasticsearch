'use strict'

const io = require('@pm2/io')

module.exports = class Actions {
  constructor (es) {
    this.es = es
  }

  register () {
    io.action('indices stats', (reply) => {
      this.es.cat.indices({ bytes: 'k' }, (err, data, code) => {
        return err ? reply(`An error has occured, \n ${err}`) : reply(data)
      })
    })

    io.action('shards stats', (reply) => {
      this.es.cat.shards({}, (err, data, code) => {
        return err ? reply(`An error has occured, \n ${err}`) : reply(data)
      })
    })

    io.action('cluster infos', (reply) => {
      this.es.nodes.info({}, (err, data, code) => {
        return err ? reply(`An error has occured, \n ${err}`) : reply(data)
      })
    })

    io.action('cluster stats', (reply) => {
      this.es.nodes.stats({}, (err, data, code) => {
        return err ? reply(`An error has occured, \n ${err}`) : reply(data)
      })
    })

    io.action('cluster health', (reply) => {
      this.es.cluster.health({}, (err, data, code) => {
        return err ? reply(`An error has occured, \n ${err}`) : reply(data)
      })
    })
  }
}
