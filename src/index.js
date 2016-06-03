var util = require('util');
var request = require('request');
var pg = require('pg');
var _ = require('lodash');

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
    if(n.indexOf(' ') >= 0) {
      throw new Error('Usernames cannot contain a space (' + n + ')');
    }
    return n.toLowerCase();
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
    var nameCsv = names.map(function(n) { return '\'' + n + '\''; }).join();
    db.query('SELECT DISTINCT ON (s.id) ss.*, s.name FROM streamer_status ss INNER JOIN streamer s ON s.id = ss.streamer_id WHERE s.name IN (' + nameCsv + ') ORDER BY s.id, ss.timestamp')
      .on('row', function(row, result) { result.addRow(row); })
      .on('end', function(result) { cb(result.rows); });
  });
}

function getDifferingStatuses(statuses, nextStatusesJSON) {
  var nextStatuses = JSON.parse(nextStatusesJSON);
  var statusesLength = statuses.length;
  var result = [];
  for(var i = 0; i < statusesLength; i++) {
    var prevStatus = statuses[i];
    var nextStatus = _.filter(nextStatuses.streams, function(s) { return s.channel.display_name === prevStatus.name; });
    if(prevStatus == null || !_.isEqual(prevStatus.status, nextStatus)) {
      result.push(nextStatus);
    }
  }
  return nextStatuses;
}

function getStreamerId(name, cb) {
  withDb(function(db) {
    db.query('SELECT id FROM streamer WHERE name = \'' + name.toLowerCase() + '\'')
      .on('row', function(row, result) { result.addRow(row); })
      .on('end', function(result) { cb(result.rows[0].id); });
  });
}

function saveStatuses(statuses) {
  var statusesLength = statuses.streams.length;
  for(var i = 0; i < statusesLength; i++) {
    var status = statuses.streams[i];
    var name = status.channel.display_name;
    var statusJSON = JSON.stringify(status);
    getStreamerId(name, function(id) {
      withDb(function(db) {
        db.query('INSERT INTO streamer_status (status, streamer_id, timestamp) VALUES (\'' + statusJSON + '\', ' + id + ', CURRENT_TIMESTAMP);');
      });
    });
  }
}

function getNames(cb) {
  withDb(function(db) {
    db.query('select name FROM streamer')
      .on('row', function(row, result) { result.addRow(row); })
      .on('end', function(result) { cb(result.rows.map(function(s) { return s.name })); });
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

