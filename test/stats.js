var assert = require('assert'),
    async = require('async'),
    stats = require('../lib/stats');
    
describe('sets', function() {
  // 'm' - for minute exists, but shouldn't be used for sets. It's too expensive.
  var retentions = ['h', 'd', 'mo']; 
  var set = 'entries.contest1';
  var start = new Date();

  it('add 3 unique values', function(done) {
    async.forEach(['user1', 'user2', 'user3'], function(val, cb) {
      stats.addToSet(set, val, retentions, cb);
    }, done);
  });

  it('get a set size of 3 for hour timeBucket', function(done) {
    var end = new Date();
    stats.getSetSizes(set, 'h', start, end, function(err, sets) {
      assert.equal(sets.length, 1);
      assert.equal(typeof sets[0].bucket, 'string');
      assert.equal(sets[0].size, 3);
      done();
    });
  });

});

describe('counters', function() {
});

describe('gauges', function() {
});
