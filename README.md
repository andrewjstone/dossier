# Intro
Dossier aggregates statistics into buckets of time using redis as the storage engine. It allows you to put data points into buckets of different width. These widths are called ***retentions*** and can be any of ```'m', 'h', 'd', 'mo'```, for minute, hour, day, month - respectively.

For instance, you coud store the number of unique visitors for every hour and every day. For every visitor view you'd use the following call to add to the unique visitors set for the given hour and day buckets.

```javascript
var stats = require('dossier');
stats.addToSet('visitors', 'user1', ['h', 'd'], callback);
```

To lookup the number of unique visitors for every hour in the last day, you can issue the following query:

```javascript
var assert = require('assert');
var end = new Date();
var start = new Date(end.getTime() - 1000*60*60*24);
stats.getSetSizes('visitors', 'h', start, end, function(err, buckets) {
  // [{bucket: '2012081219', size: 1},...]
  assert.equal(buckets.length, 24);
});
```

# API


### addToSet(set, value, retentions, timestamp, callback) -> (err)

 * ```set``` - name of the set (string)
 * ```value``` - value to store (string)
 * ```retentions``` - A list of retentions - ['h', 'd'],
 * ```[timestamp]``` - defaults to current time - (Date object)

### getSetSizes(set, retention, start, end, callback) -> (err, buckets)

 * ```set``` - name of the set (string)
 * ```retention``` - A single retention - 'mo'
 * ```start``` - The start date for the returned buckets
 * ```end``` - The end date for the returned buckets

 * ```buckets``` - ```[{bucket: '20120812', size: 3}]```


### getSetMembers(set, retention, start, end, callback) -> (err, buckets)

 * ```set``` - name of the set (string)
 * ```retention``` - A single retention - 'mo'
 * ```start``` - The start date for the returned buckets
 * ```end``` - The end date for the returned buckets

 * ```buckets``` - ```[{bucket: '20120812', members: ['val1', 'val2']}]```
