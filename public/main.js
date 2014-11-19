var socket = io();

socket.on('pushevent', function(event){
    console.log(event);

    var elem = document.getElementById("event-log");
    var text = JSON.stringify(event, undefined, 2);

    elem.innerHTML = text;
    hljs.highlightBlock(elem);
});
