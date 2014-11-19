$(function(){
    hljs.initHighlightingOnLoad();

    $.getJSON('/info', function(info) {
        $('#conn-info').text(info.address + ":" + info.port);
    });

    var start = new Date();

    var socket = io();

    var eventTypes = ['commitcommentevent', 'createevent', 'deleteevent',
     'deploymentevent', 'teamaddevent', 'watchevent',
     'deploymentstatusevent', 'downloadevent', 'followevent', 'forkevent',
     'forkapplyevent', 'gistevent', 'gollumevent', 'issuecommentevent',
     'issuesevent', 'memberevent', 'pagebuildevent', 'publicevent',
     'pullrequestevent', 'pullrequestreviewcommentevent', 'pushevent',
     'releaseevent', 'statusevent'];

    var initialData = [];
    for (i = 0; i < eventTypes.length; i++) {
        var type = eventTypes[i];
        initialData.push({
            label: type,
            values: [{time: new Date(), y: 0}],
        });
    }

    var chart = $('#area-chart').epoch({
        type: 'time.area',
        data: initialData,
        axes: ['left', 'bottom'],
        ticks: { time: 10, left: 3},
    });
    var counts = {};
    for (i = 0; i < eventTypes.length; i++) {
        var type = eventTypes[i];
        counts[type] = 0;
    }

    eventTypes.forEach(function(eventType) {
        socket.on(eventType, function(event){
            counts[eventType] += 1;
            //var elem = document.getElementById("event-log");
            //var text = JSON.stringify(event, undefined, 2);

            //elem.innerHTML = text;
            //hljs.highlightBlock(elem);
        });
    });

    window.setInterval(function() {
        var current = new Date();
        var lapse = new Date(start - current);

        var dataPoint = [];
        for (i = 0; i < eventTypes.length; i++) {
            var count = counts[eventTypes[i]];
            dataPoint.push({ time: current, y: count });
        }
        console.log(dataPoint);
        chart.push(dataPoint);
    }, 1000);
});
