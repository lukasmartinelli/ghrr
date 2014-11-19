Zepto(function($){
    hljs.initHighlightingOnLoad();

    $.getJSON('/info', function(info) {
        $('#conn-info').text(info.address + ":" + info.port);
    });

    var socket = io();

    var eventTypes = ['commitcommentevent', 'createevent', 'deleteevent',
     'deploymentevent', 'teamaddevent', 'watchevent',
     'deploymentstatusevent', 'downloadevent', 'followevent', 'forkevent',
     'forkapplyevent', 'gistevent', 'gollumevent', 'issuecommentevent',
     'issuesevent', 'memberevent', 'pagebuildevent', 'publicevent',
     'pullrequestevent', 'pullrequestreviewcommentevent', 'pushevent',
     'releaseevent', 'statusevent'];

    eventTypes.forEach(function(eventType) {
        socket.on(eventType, function(event){
            console.log(event);

            var elem = document.getElementById("event-log");
            var text = JSON.stringify(event, undefined, 2);

            elem.innerHTML = text;
            hljs.highlightBlock(elem);
        });
    });
});
