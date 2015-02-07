/*eslint new-cap:0 */
'use strict';
var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Bacon = require('baconjs').Bacon;

var accessToken = process.env.GITHUB_TOKEN;
var pollInterval = process.env.POLL_INTERVAL || 1000;
var port = process.env.VCAP_APP_PORT || 3000;
var types = ['pushevent', 'issuecommentevent', 'createevent', 'watchevent',
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
app.use(express.static(path.join(__dirname, 'public')));
http.listen(port);

var emitStatistics = function(events) {
    var typeCounts = {};

    types.forEach(function(t) {
        var count = events.filter(function(e) {
            return e.type.toLowerCase() === t;
        }).length;
        typeCounts[t] = count;
    });
    ioStats.emit('types', typeCounts);
};

var emitEvent = function(event) {
    var timestamp = new Date(event.created_at).toLocaleTimeString();
    console.log([event.id, event.type, timestamp].join('\t'));
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
