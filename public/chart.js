var EventTypeChart = function(chartPlaceholder, eventTypes){
    var chartData = _.chain(eventTypes)
                     .filter(function(type) { return type.plottable; })
                     .map(function(type) {
                         return {
                             label: type.label,
                             values: [{ time: new Date(), y: type.count }]
                         };
                     }).value();

    return $(chartPlaceholder).epoch({
        type: 'time.bar',
        data: chartData,
        axes: ['left', 'bottom'],
        ticks: { time: 10, left: 5},
        tickFormats: { bottom: function(d) { return d.toLocaleTimeString(); } },
    });
};
