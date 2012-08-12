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

stats.getSetSizes = function(set, retention, start, end, callback) {
  var buckets = timeBuckets.getRange(retention, start, end);
  var sets = [];
  async.forEach(buckets, function(bucket, cb) {
    client.scard(set+'.'+bucket, function(err, size) {
      if (err) return cb(err);
      sets.push({
        bucket: bucket,
        size: size
      });
      cb();
    });
  }, function(err) {
    callback(err, sets);
  });
};
