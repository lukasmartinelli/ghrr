var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Bacon = require('baconjs').Bacon;

const args = process.argv.slice(2);
const accessToken = args[0];
const pollInterval = args[1] || 1000;
const port = args[2] || 3000;

var deduplicator = require('./deduplicator');
var client = require('./github')(accessToken);
var info = require('./info')(client, port);

app.use(express.static(__dirname + '/public'));
app.get('/info', info.getInfo);
http.listen(port);

var emitInfo = function() {
    io.emit("info", client.getInfo());
};

var emitEvent = function(event) {
    const timestamp = new Date(event.created_at).toLocaleTimeString();
    console.log([event.id, event.type, timestamp].join("\t"));
    io.emit(event.type.toLowerCase(), event);
};

var interval = Bacon.interval(pollInterval);

interval.onValue(emitInfo);
interval.delay(5 * pollInterval).onValue(deduplicator.discardOldest);
interval.flatMap(function() { return Bacon.fromCallback(client.getEvents); })
        .flatMap(Bacon.fromArray)
        .filter(deduplicator.isUnique)
        .onValue(emitEvent);
