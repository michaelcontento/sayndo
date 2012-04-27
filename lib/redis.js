/*
 *
 * Server site redis module.
 *
 */

/*
 * Dependencies.
 */
var log = require('logerize');

var redis = {
  /*
   * Store a list of data.
   *
   * @param data, array including objects (e.g. [{key: 'foo', value: 'bar'}]).
   * @param cb, function to execute.
   */
  prefill: function redisPrefill(data, cb) {
    var self = this
      , i = 0
      , ii = data.length;

    for(i; i < ii; i++) {
      var dataset = data[i];

      if(Array.isArray(dataset.value)) saveArray(dataset);
      else if(typeof dataset.value === 'string') saveData(dataset, 'set');
      else saveData(dataset, 'hmset');
    }

    function saveArray(dataset) {
      var i = 0
        , ii = dataset.value.length;

      for(i; i < ii; i++) {
        saveArrayItem(dataset.value[i]);
      }

      function saveArrayItem(value) {
        self.client.lpush(dataset.key, value, function(err, result) {
          if(err) log.error(err.stack);

          dataset.value.shift();
          if(dataset.value.length === 0) data.shift();
          if(data.length === 0) return cb();
        });
      }
    }

    function saveData(dataset, method) {
      self.client[method](dataset.key, dataset.value, function(err, result) {
        if(err) log.error(err.stack);

        data.shift();
        if(data.length === 0) return cb();
      });
    }
  },

  /*
   * Wrap the redis client flushall() method.
   *
   * @param cb, function to execute.
   */
  flushAll: function(cb) {
    this.client.flushall(function(err, result) {
      if(err) log.error(err);

      if(result === 'OK') log.success('Flushed all redis db´s.');
      else log.error('Could not flush all redis db´s.');

      if(typeof cb === 'function') cb(err, result);
    });
  },

  /*
   * Bind the redis client on its events.
   */
  events: function() {
    redis.client.on('connect', function() {
      log.success('Connect redis client to ' + redis.client.host + ':' + redis.client.port);
    });

    redis.client.on('end', function() {
      log.info('Close redis server.');
    });

    redis.client.on('error', function (err) {
      log.error(err);
    });
  },

  /*
   * Get a fresh redis client.
   *
   * @param port, string of the redis server port.
   * @param host, string of the redis server host.
   *
   * @return object, of a fresh redis client.
   */
  getClient: function redisGetClient(port, host) {
    port = port || redis.config.port;
    host = host || redis.config.host;

    return require('redis').createClient(port, host);
  },

  /*
   * Set the redis server configuration.
   *
   * @dependencie port, string of the redis server port.
   * @dependencie host, string of the redis server host.
   */
  config: {
    port: '6379',
    host: '127.0.0.1'
  },

  /*
   * Initialize the redis module.
   *
   * @return object, including a fresh redis client.
   */
  init: function redisInit() {
    redis.client = redis.getClient();

    redis.events();

    return redis;
  },
};

module.exports = redis;

