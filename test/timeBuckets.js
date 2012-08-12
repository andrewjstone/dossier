var assert = require('assert'),
    async = require('async'),
    timeBuckets = require('../lib/timeBuckets.js');

describe('timeBucket API', function() {
  it('get current time buckets for "m", "h", "d", "mo"', function() {
    var buckets = timeBuckets.get(['m', 'h', 'd', 'mo']);
    assert.equal(buckets.length, 4);
  });

});

describe('timebased operations', function() {
  it('get the next minute given a minute time bucket', function() {
    var bucket = '201208121903';
    assert.equal(timeBuckets.nextMinute(bucket), '201208121904');
  });

  it('cascading rollover by minute', function() {
    var bucket = '201212312359';
    assert.equal(timeBuckets.nextMinute(bucket), '201301010000');
  });

  it('get the next hour given an hour time bucket', function() {
    var bucket = '2012081219';
    assert.equal(timeBuckets.nextHour(bucket), '2012081220');
  });

  it('cascading rollover by hour', function() {
    var bucket = '2012123123';
    assert.equal(timeBuckets.nextHour(bucket), '2013010100');
  });

  it('get the next day given a day time bucket', function() {
    var bucket = '20120812';
    assert.equal(timeBuckets.nextDay(bucket), '20120813');
  });

  it('cascading rollover by day', function() {
    var bucket = '20121231';
    assert.equal(timeBuckets.nextDay(bucket), '20130101');
  });

  it('get the next month given a month time bucket', function() {
    var bucket = '201208';
    assert.equal(timeBuckets.nextMonth(bucket), '201209');
  });

  it('cascading rollover by month', function() {
    var bucket = '201212';
    assert.equal(timeBuckets.nextMonth(bucket), '201301');
  });

});
