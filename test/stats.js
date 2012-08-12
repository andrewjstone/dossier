var assert = require('assert'),
    async = require('async'),
    stats = require('../lib/stats');
    
describe('sets', function() {
  var set = 'entries.contest1';

  // 'm' - for minute exists, but shouldn't be used for sets. It's too expensive.
  var buckets = ['h', 'd', 'mo']; 
  var start = new Date();

  it('add 3 unique values', function(done) {
    async.forEach(['user1', 'user2', 'user3'], function(val, cb) {
      stats.addToSet(set, val, buckets, cb);
    }, done);
  });

  it('get a set size of 3 for each sole time bucket', function(done) {
    var end = new Date();
    stats.getSetSizes(set, buckets, start, end, function(err, setSizes) {
      assert(!err);
      ['h', 'd', 'mo'].forEach(function(bucket) {
        var timeBuckets = setSizes[bucket];
        assert.equal(timeBuckets.length, 1); 
        assert(timeBuckets[0].time);
        assert.equal(timeBuckets[0].size, 3);
      });
      done();
    });
  });

});

describe('counters', function() {
});

describe('gauges', function() {
});
