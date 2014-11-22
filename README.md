GHRR
====

Receive all Github events in realtime with [socket.io](http://socket.io/) from the [Github Realtime Relay](http://oghrr.lukasmartinelli.ch/).
This is probably the simplest way to create a realtime application on top of Github.

## Server (Node)

```javascript
var url = 'http://ghrr.lukasmartinelli.ch';
var socket = require('socket.io-client')(url);

socket.on('pushevent', function(event){
   console.log('Push: ' + event.repository.full_name);
});

```

## Client (Browser)

```javascript
var url = 'http://ghrr.lukasmartinelli.ch';
var socket = io(url);

socket.on('pushevent', function (event) {
   console.log('Push: ' + event.repository.full_name);
});
```

## Host it yourself

Install with npm.

```bash
npm install ghrr
```

In order to poll all events you need an OAUTH access token.
Run the github realtime relay with a poll rate of `1000` and on port `80`.

```bash
npm install ghrr
npm run start "YOUR GITHUB ACCESS TOKEN" 1000 80
```
