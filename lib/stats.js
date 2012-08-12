var redis = require('redis'),
    async = require('async');

var client = redis.createClient();

var stats = module.exports = {};

stats.addToSet = function(set, value, buckets, callback) {
  var timeBuckets = buildTimeBuckets(buckets);
  async.forEach(timeBuckets, function(bucket, cb) {
    // TODO: Validate buckets
    client.sadd(set+'.'+bucket, value, cb);
  }, callback);
};

stats.getSetSize = function(set, buckets, start, end, callback) {
};

function format(num) {
  if (num < 10) {
    return '0' + num;
  } else {
    return String(num);
  }
}

function buildTimeBuckets(buckets) {
  var timeBuckets = [];
  var date = new Date();
  var year = date.getUTCFullYear();
  var month = format(date.getUTCMonth() + 1);
  var day = format(date.getUTCDate());
  var hour = format(date.getUTCHours());
  var minute = format(date.getUTCMinutes());
  buckets.forEach(function(bucket) {
    switch(bucket) {
      case 'm':
        timeBuckets.push('' + year + month + day + hour + minute);
        break;
      case 'h': 
        timeBuckets.push('' + year + month + day + hour);
        break;
      case 'd':
        timeBuckets.push('' + year + month + day);
        break;
      case 'mo':
        timeBuckets.push('' + year + month);
        break;
      default:
        console.error('Bad bucket: '+bucket);
    };
  });
  return timeBuckets;
};
