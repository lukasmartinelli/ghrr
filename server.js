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

var createRingBuffer = function(length){
  var pointer = 0, buffer = []; 
  return {
    get  : function(key){return buffer[key];},
    push : function(item){
      buffer[pointer] = item;
      pointer = (length + pointer +1) % length;
    }
  };
};

var eventBuffer = createRingBuffer(5);
for(var i = 0; i < 5; i++) {
    eventBuffer.push({}); 
}

var isUnique = function(event) {
    for(var i = 0; i < 5; i++) {
        var ids = eventBuffer.get(i);
        if(event.id in ids) {
            duplicates += 1;
            ids[event.id] += 1;
            return false;
        } else {
            ids[event.id] = 1;
            return true;
        }
    }
}

Bacon.interval(1000).onValue(relayInfo);
Bacon.interval(pollInterval).onValue(function() { eventBuffer.push({}); });
Bacon.interval(pollInterval)
     .flatMap(function() { return Bacon.fromCallback(client.getEvents); })
     .flatMap(Bacon.fromArray)
     .filter(isUnique)
     .onValue(relayEvent);
