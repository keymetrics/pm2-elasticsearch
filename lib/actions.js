'use strict'

const io = require('@pm2/io')
const filesize = require('filesize')

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

    io.action('get unassigned shards', (reply) => {
      this.es.cat.shards({
        h: [ 'index', 'state', 'unassigned.reason' ]
      }, (err, data) => {
        return err
          ? reply(`An error has occured, \n ${err}`)
          : reply(data.split('\n').filter(line => line.indexOf('UNASSIGNED') !== -1).join('\n'))
      })
    })

    io.action('get biggers indices', (reply) => {
      this.es.cat.indices({
        s: [ 'docs.count:desc' ]
      }, (err, data) => {
        return err ? reply(`An error has occured, \n ${err}`) : reply(data)
      })
    })

    io.action('get biggers indices stats', async reply => {
      const final = {}

      const stats = await this.es.indices.stats()
      await Promise.all(Object.keys(stats.indices)
        .map(name => {
          stats.indices[name].name = name
          return stats.indices[name]
        })
        .sort((a, b) => {
          return b.total.docs.count - a.total.docs.count
        })
        .slice(0, 10)
        .map(async indice => {
          final[indice.name] = {
            docs: indice.total.docs.count,
            size: filesize(indice.total.store.size_in_bytes),
            types: {}
          }
          const mapping = await this.es.indices.getMapping({
            index: indice.name
          })
          const types = Object.keys(mapping[indice.name].mappings)
          await Promise.all(types.map(async type => {
            const typeStats = await this.es.indices.stats({
              index: indice.name,
              types: type
            })
            final[indice.name].types[type] = {
              docs: typeStats.indices[indice.name].primaries.docs.count,
              size: filesize(typeStats.indices[indice.name].primaries.store.size_in_bytes)
            }
          }))
        }))

      reply(final)
    })
  }
}
