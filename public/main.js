(function(){
    var list = EventTypeList();
    var chart = EventTypeChart(document.getElementById('event-chart'),
                               list.types());

    hljs.initHighlightingOnLoad();
    ko.applyBindings(list);

    io('/statistics').on('types', function(typeCounts) {
        list.types().forEach(function (type) {
            type.increment(typeCounts[type.name]);
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
})();
