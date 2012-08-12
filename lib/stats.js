var redis = require('redis'),
    async = require('async'),
    timeBuckets = require('./timeBuckets');

var client = redis.createClient();

var stats = module.exports = {};

stats.addToSet = function(set, value, retentions, callback) {
  var buckets = timeBuckets.get(retentions);
  async.forEach(buckets, function(bucket, cb) {
    client.sadd(set+'.'+bucket, value, cb);
  }, callback);
};

