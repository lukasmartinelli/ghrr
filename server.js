var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Bacon = require('baconjs').Bacon;

var args = process.argv.slice(2);
var accessToken = args[0];
var pollInterval = args[1] || 1000;
var port = args[2] || 3000;

var client = require('./github')(accessToken);
var dns = require('dns');
var os = require('os');

var connectionInfo = function(callback) {
    dns.lookup(os.hostname(), function (err, addr, fam) {
        callback({
            "address": addr,
            "hostname": os.hostname(),
            "port": port,
        });
    });
};

var relayInfo = function() {
    io.emit("info", client.getInfo());
};

var relayEvent = function(event) {
    var timestamp = new Date(event.created_at).toLocaleTimeString();
    console.log([event.id, event.type, timestamp].join("\t"));
    io.emit(event.type.toLowerCase(), event);
};

var duplicates = 0;
var getInfo = function(req, res) {
    connectionInfo(function(connInfo) {
        res.json({
            'connection': connInfo,
            'client': client.getInfo(),
            "poll_interval": pollInterval,
            "duplicates": duplicates,
        });
    });
};

app.use(express.static(__dirname + '/public'));
app.get('/info', getInfo);
http.listen(port);

var compareEvents = function(a, b) {
    if(a.id < b.id) { return -1; }
    if(a.id > b.id) { return 1; }
    return 0;
}

var findAndCountDuplicates = function(a, b) {
    if(a.id === b.id) {
        duplicates += 1;
        return true;
    }
    return false;
};

var ids = {};
var findAllDuplicatesNonScalableAndMemoryLeaky = function(event) {
    if(event.id in ids) {
        duplicates += 1;
        ids[event.id] += 1;
        return false;
    } else {
        ids[event.id] = 1;
        return true;
    }
};

var filterStream = function(stream) {
    return stream
         .bufferWithTime(2 * pollInterval)
         .map(function(events) { return events.sort(compareEvents); })
         .flatMap(Bacon.fromArray)
         .skipDuplicates(findAndCountDuplicates)
};

Bacon.interval(1000).onValue(relayInfo);
Bacon.interval(pollInterval)
     .flatMap(function() { return Bacon.fromCallback(client.getEvents); })
     .flatMap(Bacon.fromArray)
     .filter(findAllDuplicatesNonScalableAndMemoryLeaky)
     .onValue(relayEvent);
