$(function(){
    hljs.initHighlightingOnLoad();
    var list = EventTypeList();
    var chart = EventTypeChart('#event-chart', list.types());
    var socket = io();

    $.getJSON('/info', function(info) {
        $('#conn-info').text(info.address + ":" + info.port);
    });


    ko.applyBindings(list);

    list.types().forEach(function(type) {
        socket.on(type.name, function(event){
            type.increment();
        });
    });

    window.setInterval(function() {
        var current = new Date();
        var dataPoint = _.chain(list.types())
                         .filter('plottable')
                         .map(function(type) {
                            var count = type.count;
                            type.reset();
                            return { time: current, y: count };
                         }).value();
        chart.push(dataPoint);
    }, 1000);
});
