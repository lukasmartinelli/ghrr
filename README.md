OGHRR
=====

[Open Github Realtime Relay](http://oghrr.lukasmartinelli.ch/)

## Use from NodeJS

```javascript
var client = require('socket.io-client');
var socket = client.connect("oghrr.lukasmartinelli.ch", { port: 80});
socket.on('pushevent', function(event){
       console.log(event);
});
```

## Use from Client

```javascript
var socket = io('http://oghrr.lukasmartinelli.ch:80');

socket.on('pushevent', function (event) {
        console.log(event);
});

```

