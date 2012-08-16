var redis = require('redis'),
    async = require('async'),
    timeBuckets = require('./timeBuckets'),
    fs = require('fs');

var client = redis.createClient();

var stats = module.exports = {};

stats.client = client;

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
        count: count || 0
      });
      cb();
    });
  }, function(err) {
    callback(err, counts);
  });
};

stats.export = function(sets, counters, filename, callback) {
  var file = fs.createWriteStream(filename);
  async.series([
    function(cb) {
      exportSets(sets, file, cb);
    },
    function(cb) {
      exportCounters(counters, file, cb);
    }], 
    callback
  );
};

stats.import = function(filename, callback) {
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) return callback(err);
    var lines = data.split('\n');
    var fn = importSet;
    async.forEach(lines, function(line, cb) {
      if (line === 'sets') return cb();
      if (line === 'counters') {
        fn = importCounter;
        return cb();
      }
      var kv = line.split(' ');
      fn(kv[0], kv[1], cb);
    }, callback);
  });
};

function importSet(key, setString, cb) {
  var members = setString.split(',');
  client.sadd(key, members, cb);
}

function importCounter(key, val, cb) {
  client.set(key, val, cb);
}

function exportSets(sets, file, callback) {
  file.write('sets\n');
  async.forEachSeries(
    sets,
    function(set, cb) {
      client.keys(set+'.*', function(err, keys) {
        async.forEachSeries(keys, function(key, cb) {
          client.smembers(key, function(err, members) {
            file.write(key+' '+members +'\n');
            cb();
          });
        }, cb);
      });
    }, 
    callback
  );
};

function exportCounters(counters, file, callback) {
  file.write('counters\n');
  async.forEachSeries(
    counters,
    function(counter, cb) {
      client.keys(counter+'.*', function(err, keys) {
        async.forEachSeries(keys, function(key, cb) {
          client.get(key, function(err, val) {
            file.write(key+' '+val +'\n');
            cb();
          });
        }, cb);
      });
    }, 
    callback
  );
};

