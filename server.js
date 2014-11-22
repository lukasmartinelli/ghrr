var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Bacon = require('baconjs').Bacon;

const args = process.argv.slice(2);
const accessToken = args[0];
const pollInterval = args[1] || 1000;
const port = args[2] || 3000;
const types = ['pushevent', 'issuecommentevent', 'createevent', 'watchevent',
             'pullrequestevent', 'issuesevent', 'pullrequestreviewcommentevent',
             'deleteevent', 'forkevent', 'commitcommentevent', 'followevent',
             'gollumevent', 'memberevent', 'downloadevent', 'pagebuildevent',
             'publicevent', 'forkapplyevent', 'gistevent', 'releaseevent',
             'deploymentevent', 'deploymentstatusevent', 'statusevent',
             'teamaddevent'];

var deduplicator = require('./deduplicator');
var client = require('./github')(accessToken);

var ioStats = io.of('/statistics');
var ioEvents = io.of('/events');

io.set('origins', '*:*');
app.use(express.static(__dirname + '/public'));
http.listen(port);

var emitStatistics = function(events) {
    var typeCounts = {};
    var i;

    for(i = 0; i < types.length; i++) {
        var type = types[i];
        var count = events.filter(function(e) {
            return e.type.toLowerCase() == type; 
        }).length;
        typeCounts[type] = count;
    }
    ioStats.emit('types' ,typeCounts);
};

var emitEvent = function(event) {
    const timestamp = new Date(event.created_at).toLocaleTimeString();
    console.log([event.id, event.type, timestamp].join("\t"));
    ioEvents.emit(event.type.toLowerCase(), event);
};

var interval = Bacon.interval(pollInterval);
var eventStream = interval.flatMap(function() {
                    return Bacon.fromCallback(client.getEvents); 
                  })
                  .flatMap(Bacon.fromArray)
                  .filter(deduplicator.isUnique);

eventStream.bufferWithTime(pollInterval).onValue(emitStatistics);
eventStream.onValue(emitEvent);
interval.delay(5 * pollInterval).onValue(deduplicator.discardOldest);
