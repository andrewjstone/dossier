var assert = require('assert'),
    async = require('async'),
    stats = require('../lib/stats');
    
// 'm' - for minute exists, but shouldn't be used for sets. It's too expensive.
var retentions = ['h', 'd', 'mo']; 
var set = 'entries.contest1';
var start = new Date();
var end = new Date(Date.now() + 1000*60*60*3);

describe('setup', function() {
  it('flush redis stuff', function(done) {
    flushRedis(done);
  });
});

describe('sets', function() {
  it('add 3 unique values to the bucket for the current hour, day, and month', function(done) {
    async.forEach(['user1', 'user2', 'user3'], function(val, cb) {
      stats.addToSet(set, val, retentions, cb);
    }, done);
  });

  it('get a set size of 3 for the current hour', function(done) {
    verifySetSize(done);
  });

  it('get the set in the first bucket and ensure it has 4 members', function(done) {
    verifySetMembers(done);
  });

});


describe('counters', function() {
  var start = new Date();

  it('increment a counter', function(done) {
    stats.increment('totalRequests', 1, ['m'], done);
  });

  it('retrieve the counter', function(done) {
    verifyCounter(done);
  });
});

describe('export and import', function() {
  it('export entries.contest1 set and totalRequestsCounter', function(done) {
    stats.export(['entries.contest1'], ['totalRequests'], 'testDump.txt', done);
  });

  it('flush redis', function(done) {
    flushRedis(done);
  });

  it('assure set does not exist', function(done) {
    stats.getSetSizes(set, 'h', start, end, function(err, buckets) {
      assert.equal(buckets.length, 4);
      assert.equal(typeof buckets[0].bucket, 'string');
      assert.equal(buckets[0].size, 0);
      done();
    });
  });

  it('assure counter does not exist', function(done) {
    var end = new Date();
    stats.getCounters('totalRequests', 'm', start, end, function(err, buckets) {
      assert(!err);
      assert.equal(buckets.length, 1);
      assert.equal(typeof buckets[0].bucket, 'string');
      assert.equal(buckets[0].count, 0);
      done();
    });
  });

  it('import entries.contest1 set and totalRequestCounter', function(done) {
    stats.import('testDump.txt', done);
  });

  it('verify set exists', function(done) {
    verifySetMembers(function() {
      verifySetSize(function() {
        done();
      });
    });
  });

  it('verify counter exists', function(done) {
    verifyCounter(done);
  });

});

function verifyCounter(done) {
  var end = new Date();
  stats.getCounters('totalRequests', 'm', start, end, function(err, buckets) {
    assert(!err);
    assert.equal(buckets.length, 1);
    assert.equal(typeof buckets[0].bucket, 'string');
    assert.equal(buckets[0].count, 1);
    done();
  });
}

function flushRedis(done) {
  stats.client.keys('entries.contest1.*', function(err, keys) {
    assert(!err);
    stats.client.del(keys, function(err) {
      assert(!err);
      stats.client.keys('totalRequests.*', function(err, keys) {
        assert(!err);
        stats.client.del(keys, done);
      });
    });
  });
}

function verifySetMembers(done) {
  stats.getSetMembers(set, 'h', start, end, function(err, buckets) {
    assert(!err);
    assert.equal(buckets.length, 4);
    assert(Array.isArray(buckets[0].members));
    assert.equal(buckets[0].members.length, 3);
    done();
  });
}

function verifySetSize(done) {
  stats.getSetSizes(set, 'h', start, end, function(err, buckets) {
    assert.equal(buckets.length, 4);
    assert.equal(typeof buckets[0].bucket, 'string');
    assert.equal(buckets[0].size, 3);
    assert.equal(buckets[1].size, 0);
    assert.equal(buckets[1].size, 0);
    assert.equal(buckets[1].size, 0);
    done();
  });
}
