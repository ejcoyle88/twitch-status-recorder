var util = require('util');
var request = require('request');
var pg = require('pg');

pg.defaults.ssl = true;

function withDb(cb) {
  var dbString = process.env['DATABASE_URL'];
  if(dbString == null) {
    throw new Error('You must set a DATABASE_URL enviroment variable containing the database connection string');
  }
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if(err) {
      console.log(err);
      throw err;
    }
    cb(client);
  });
}

function sanatizeNames(names) {
  return names.map(function(n) {
    if(n.contains(' ')) {
      throw new Error('Usernames cannot contain a space (' + n + ')');
    }
    return n.toLowerCase().Trim();
  });
}

function getNextStatuses(names, cb) {
  var safeNames = sanatizeNames(names);
  var apiUrl = 'https://api.twitch.tv/kraken/streams?channel=';
  var nameCsv = names.join();
  var requestUrl = apiUrl + nameCsv;
  request(requestUrl, function(error, response, body) {
    if(error || response.statusCode !== 200) {
      console.log('Request error (' + response.statusCode + '): ' + error);
    }
    cb(body);
  });
}

function getCurrentStatuses(names, cb) {
  withDb(function(db) {
    var nameCsv = names.join();
    db.query('SELECT ss.* FROM streamer_statuses ss INNER JOIN streamer s ON s.id = ss.streamer_id WHERE s.name IN (' + nameCsv + ') HAVING MAX(ss.timestamp) GROUP BY s.id')
      .on('row', function(row, result) { result.addRow(row); })
      .on('end', function(result) { cb(result.rows); });
  });
}

function getDifferingStatuses(statuses, nextStatuses) {

}

function saveStatuses(statuses) {

}

function getNames(cb) {
  withDb(function(db) {
    db.query('select name FROM streamer')
      .on('row', function(row, result) { result.addRow(row); })
      .on('end', function(result) { cb(result.rows); });
  });
}

var interval = process.env['TWITCH_STATUS_RECORDER_INTERVAL'] === null ? 60000 : process.env.TWITCH_STATUS_RECORDER_INTERVAL;
setInterval(function() {
  getNames(function(names) {
    if(names.length > 0) {
      getCurrentStatuses(names, function(currentStatuses) {
        getNextStatuses(names, function(nextStatuses) {
          var differentStatuses = getDifferingStatuses(currentStatuses, nextStatuses);
          saveStatuses(differentStatuses);
        });
      });
    }
  });
}, interval);

