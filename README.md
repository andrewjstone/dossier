# Intro
Dossier aggregates statistics into buckets of time using redis as the storage engine. It allows you toput data points into buckets of different width. These widths are called ***retentions*** and can be any of ```'m' | 'h' | 'd' | 'mo'```, for minute, hour, day, month - respectively.

# API

```javascript
var stats = require('dossier');
```

### addToSet(set, value, retentions, timestamp, callback) -> (err)

 * ```set``` - name of the set (string)
 * ```value``` - value to store (string)
 * ```retentions``` - A list of retentions - ['h', 'd'],
 * ```[timestamp]``` - defaults to current time - (Date object)

### getSetSizes(set, retention, start, end, callback) -> (err, sets)

 * ```set``` - name of the set (string)
 * ```retention``` - A single retention - 'mo'
 * ```start``` - The start date for the returned buckets
 * ```end``` - The end date for the returned buckets

 * sets - [{bucket: '20120812', size: 3}];


### getSetMembers(set, retention, start, end, callback) -> (err, sets)

 * ```set``` - name of the set (string)
 * ```retention``` - A single retention - 'mo'
 * ```start``` - The start date for the returned buckets
 * ```end``` - The end date for the returned buckets

 * sets - [{bucket: '20120812', members: ['val1', 'val2']}]
