var assert = require('assert'),
    async = require('async'),
    stats = require('../lib/stats');
    
describe('sets', function() {
  // 'm' - for minute exists, but shouldn't be used for sets. It's too expensive.
  var retentions = ['h', 'd', 'mo']; 
  var set = 'entries.contest1';
  var start = new Date();
  var end = new Date(Date.now() + 1000*60*60*3);

  it('add 3 unique values to the bucket for the current hour, day, and month', function(done) {
    async.forEach(['user1', 'user2', 'user3'], function(val, cb) {
      stats.addToSet(set, val, retentions, cb);
    }, done);
  });

  it('get a set size of 3 for the current hour', function(done) {
    stats.getSetSizes(set, 'h', start, end, function(err, buckets) {
      assert.equal(buckets.length, 4);
      assert.equal(typeof buckets[0].bucket, 'string');
      assert.equal(buckets[0].size, 3);
      assert.equal(buckets[1].size, 0);
      assert.equal(buckets[1].size, 0);
      assert.equal(buckets[1].size, 0);
      done();
    });
  });

  it('get the set in the first bucket and ensure it has 4 members', function(done) {
    stats.getSetMembers(set, 'h', start, end, function(err, buckets) {
      assert(!err);
      assert.equal(buckets.length, 4);
      assert(Array.isArray(buckets[0].members));
      assert.equal(buckets[0].members.length, 3);
      done();
    });
  });

});

describe('counters', function() {
  var start = new Date();

  it('increment a counter', function(done) {
    stats.increment('totalRequests', 1, ['m'], done);
  });

  it('retrieve the counter', function(done) {
    var end = new Date();
    stats.getCounters('totalRequests', 'm', start, end, function(err, buckets) {
      assert(!err);
      assert.equal(buckets.length, 1);
      assert.equal(typeof buckets[0].bucket, 'string');
      assert.equal(buckets[0].count, 1);
      done();
    });
  });
});

