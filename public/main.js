$(function(){
    hljs.initHighlightingOnLoad();

    $.getJSON('/info', function(info) {
        $('#conn-info').text(info.address + ":" + info.port);
    });

    var start = new Date();
    var initialData = [{
        label: "all",
        values: [ {time: new Date(), y: 0} ]
    }];

    var chart = $('#area-chart').epoch({
        type: 'time.line',
        data: initialData,
        axes: ['left', 'bottom'],
        ticks: { time: 10, left: 3},
    });

    var socket = io();

    var eventTypes = ['commitcommentevent', 'createevent', 'deleteevent',
     'deploymentevent', 'teamaddevent', 'watchevent',
     'deploymentstatusevent', 'downloadevent', 'followevent', 'forkevent',
     'forkapplyevent', 'gistevent', 'gollumevent', 'issuecommentevent',
     'issuesevent', 'memberevent', 'pagebuildevent', 'publicevent',
     'pullrequestevent', 'pullrequestreviewcommentevent', 'pushevent',
     'releaseevent', 'statusevent'];

    var allCount = 0;
    eventTypes.forEach(function(eventType) {
        var count = 0;
        socket.on(eventType, function(event){
            allCount += 1;
            count += 1;
            //var elem = document.getElementById("event-log");
            //var text = JSON.stringify(event, undefined, 2);

            //elem.innerHTML = text;
            //hljs.highlightBlock(elem);
        });
    });

    window.setInterval(function() {
        var current = new Date();
        var lapse = new Date(start - current);
        var dataPoint = [ {time: current, y: allCount } ];
        chart.push(dataPoint);
    }, 1000);
});
