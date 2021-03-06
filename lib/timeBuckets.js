var timeBuckets = module.exports = {};

timeBuckets.get = function(retentions, timestamp) {
  if (Array.isArray(retentions)) {
    return buildTimeBuckets(retentions, timestamp || null);
  } else {
    return buildTimeBucket(retentions, timestamp || null);
  }
}

timeBuckets.getRange = function(retention, startDate, endDate) {
  endDate = endDate || new Date();
  var start = buildTimeBucket(retention, startDate);
  var end = buildTimeBucket(retention, endDate);
  var next = timeBuckets.next[retention];
  var buckets = [start];
  var bucket = start;
  while (bucket !== end) {
    bucket = next(bucket);
    buckets.push(bucket);
  }
  return buckets;
}

timeBuckets.nextMinute = function(bucket) {
  var year = Number(bucket.slice(0, 4));
  var month = Number(bucket.slice(4, 6));
  var day = Number(bucket.slice(6, 8));
  var hour = Number(bucket.slice(8, 10));
  var minute = Number(bucket.slice(10));

  if (++minute === 60) {
    // rollover hour
    minute = 0;
    if (++hour === 24) {
      // rollover day
      hour = 0;
      ++day;
      if (rolloverMonth(day, month, year)) {
        // rollover month
        day = 1;
        if (++month === 13) {
          // rollover year
          month = 1;
          ++year;
        }
      }
    }
  }
  return '' + year + format(month) + format(day) + format(hour) + format(minute);
}

timeBuckets.nextHour = function(bucket) {
  var year = Number(bucket.slice(0, 4));
  var month = Number(bucket.slice(4, 6));
  var day = Number(bucket.slice(6, 8));
  var hour = Number(bucket.slice(8, 10));

  if (++hour === 24) {
    // rollover day
    hour = 0;
    ++day;
    if (rolloverMonth(day, month, year)) {
      // rollover month
      day = 1;
      if (++month === 13) {
        // rollover year
        month = 1;
        ++year;
      }
    }
  }
  return '' + year + format(month) + format(day) + format(hour);
}

timeBuckets.nextDay = function(bucket) {
  var year = Number(bucket.slice(0, 4));
  var month = Number(bucket.slice(4, 6));
  var day = Number(bucket.slice(6, 8));

  ++day;
  if (rolloverMonth(day, month, year)) {
    // rollover month
    day = 1;
    if (++month === 13) {
      // rollover year
      month = 1;
      ++year;
    }
  }
  return '' + year + format(month) + format(day);
}

timeBuckets.nextMonth = function(bucket) {
  var year = Number(bucket.slice(0, 4));
  var month = Number(bucket.slice(4, 6));

  if (++month === 13) {
    // rollover year
    month = 1;
    ++year;
  }
  return '' + year + format(month);
}

timeBuckets.next = {
  'm': timeBuckets.nextMinute,
  'h': timeBuckets.nextHour,
  'd': timeBuckets.nextDay,
  'mo': timeBuckets.nextMonth
};


// We 1 based the months, so just use 0 for the 0th index
var monthLengths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function rolloverMonth(day, month, year) {
  var maxDays = monthLengths[month];
  if (month === 2) { // February
    if (isLeapYear(year)) {
      maxDays = 29;
    }
  }
  return day > maxDays;
}

// http://en.wikipedia.org/wiki/Leap_year#Algorithm
function isLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
}

function buildTimeBucket(retention, timestamp) {
  var date = timestamp || new Date();
  var year = date.getUTCFullYear();
  var month = format(date.getUTCMonth() + 1);
  var day = format(date.getUTCDate());
  var hour = format(date.getUTCHours());
  var minute = format(date.getUTCMinutes());
  switch(retention) {
    case 'm':
      return '' + year + month + day + hour + minute;
    case 'h': 
      return'' + year + month + day + hour;
    case 'd':
      return '' + year + month + day;
    case 'mo':
      return '' + year + month;
    default:
      return null;
  };
}

function buildTimeBuckets(retentions, timestamp) {
  var timeBuckets = [];
  retentions.forEach(function(retention) {
    var bucket = buildTimeBucket(retention, timestamp || null);
    if (bucket) timeBuckets.push(bucket);
  });
  return timeBuckets;
};

function format(num) {
  if (num < 10) {
    return '0' + num;
  } else {
    return String(num);
  }
}
