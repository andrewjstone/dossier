var redis = require('redis'),
    async = require('async'),
    timeBuckets = require('./timeBuckets');

var client = redis.createClient();

var stats = module.exports = {};

stats.addToSet = function(set, value, retentions, timestamp, callback) {
  if (arguments.length === 4) {
    callback = timestamp;
    timestamp = null;
  }
  var buckets = timeBuckets.get(retentions, timestamp);
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

stats.getSetMembers = function(set, retention, start, end, callback) {
  var buckets = timeBuckets.getRange(retention, start, end);
  var sets = [];
  async.forEach(buckets, function(bucket, cb) {
    client.smembers(set+'.'+bucket, function(err, members) {
      if (err) return cb(err);
      sets.push({
        bucket: bucket,
        members: members
      });
      cb();
    });
  }, function(err) {
    callback(err, sets);
  });
};

stats.increment = function(counter, value, retentions, timestamp, callback) {
  if (arguments.length === 4) {
    callback = timestamp;
    timestamp = null;
  }
  var buckets = timeBuckets.get(retentions, timestamp);
  async.forEach(buckets, function(bucket, cb) {
    var key = counter+'.'+bucket;
      client.incrby(key, value, cb);
  }, callback);
};

stats.getCounters = function(counter, retention, start, end, callback) {
  var buckets = timeBuckets.getRange(retention, start, end);
  var counts = [];
  async.forEach(buckets, function(bucket, cb) {
    client.get(counter+'.'+bucket, function(err, count) {
      if (err) return cb(err);
      counts.push({
        bucket: bucket,
        count: count
      });
      cb();
    });
  }, function(err) {
    callback(err, counts);
  });
};
