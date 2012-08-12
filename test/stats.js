var assert = require('assert'),
    async = require('async'),
    stats = require('../lib/stats');
    
describe('sets', function() {
  // 'm' - for minute exists, but shouldn't be used for sets. It's too expensive.
  var retentions = ['h', 'd', 'mo']; 
  var set = 'entries.contest1';
  var start = new Date();
  var end = new Date(Date.now() + 1000*60*60*3);

  it('add 3 unique values', function(done) {
    async.forEach(['user1', 'user2', 'user3'], function(val, cb) {
      stats.addToSet(set, val, retentions, cb);
    }, done);
  });

  it('get a set size of 3 for hour timeBucket', function(done) {
    stats.getSetSizes(set, 'h', start, end, function(err, sets) {
      assert.equal(sets.length, 4);
      assert.equal(typeof sets[0].bucket, 'string');
      assert.equal(sets[0].size, 3);
      assert.equal(sets[1].size, 0);
      assert.equal(sets[1].size, 0);
      assert.equal(sets[1].size, 0);
      done();
    });
  });

  it('get the set in the first bucket and ensure it has 4 members', function(done) {
    stats.getSetMembers(set, 'h', start, end, function(err, sets) {
      assert(!err);
      assert.equal(sets.length, 4);
      assert(Array.isArray(sets[0].members));
      assert.equal(sets[0].members.length, 3);
      done();
    });
  });

});

describe('counters', function() {
});

describe('gauges', function() {
});
