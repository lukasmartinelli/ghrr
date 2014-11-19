$(function(){
    hljs.initHighlightingOnLoad();

    $.getJSON('/info', function(info) {
        $('#conn-info').text(info.address + ":" + info.port);
    });

    var start = new Date();
    var socket = io();

    var EventType = function(name, label, plottable, color) {
        this.name = name;
        this.label = label;
        this.count = 0;
        this.allCount = ko.observable(0);
        this.updateDate = ko.observable(new Date());
        this.plottable = plottable;
        this.color = color;

        this.countPerSecond = ko.computed(function() {
            var diff = (this.updateDate() - start) / 1000;
            var avg = this.allCount() / diff;
            return isNaN(avg) || !isFinite(avg) ? 0 : avg.toFixed(2);
        }.bind(this));

        this.increment = function() {
            this.updateDate(new Date());
            this.count += 1;
            this.allCount(this.allCount() + 1);
        };

        this.clear = function() {
            this.count = 0;
        }
    };

    var EventTypeList = function(eventTypes) {
        this.eventtypes = ko.observableArray(eventTypes);
    };
    
    var types = [
         { name: 'pushevent', label: 'push', color: '#1f77b4', plottable: true },
         { name: 'issuecommentevent', label: 'issue comment',
           color: '#ff7f0e', plottable: true},
         { name: 'createevent', label: 'create',
           color: '#2ca02c', plottable: true},
         { name: 'watchevent', label: 'watch', color: '#d62728', plottable: true },
         { name: 'pullrequestevent', label: 'pull request',
           color: '#9467bd', plottable: true},
         { name: 'issuesevent', label: 'issues',
           color: '#8c564b', plottable: true},
         { name: 'pullrequestreviewcommentevent', label: 'review comment',
            color: '#e377c2', plottable: true},
         { name: 'forkevent', label: 'fork'},
         { name: 'commitcommentevent', label: 'commit comment'},
         { name: 'followevent', label: 'follow'},
         { name: 'deleteevent', label: 'delete'},
         { name: 'gollumevent', label: 'gollum'},
         { name: 'memberevent', label: 'member'},
         { name: 'downloadevent', label: 'download'},
         { name: 'pagebuildevent', label: 'page build'},
         { name: 'publicevent', label: 'public'},
         { name: 'forkapplyevent', label: 'fork apply'},
         { name: 'gistevent', label: 'gist'},
         { name: 'releaseevent', label: 'release'},
         { name: 'deploymentevent', label: 'deployment'},
         { name: 'deploymentstatusevent', label: 'deployment status'},
         { name: 'statusevent', label: 'status'},
         { name: 'teamaddevent', label: 'team add'},
    ];
    var getEventTypes = function() {
        return _.map(types, function(type) {
            return new EventType(type.name, type.label,
                                 type.plottable || false,
                                 type.color || '#324d5b');
        });
    };

    var eventTypeList = new EventTypeList(getEventTypes());
    ko.applyBindings(eventTypeList);

    var getInitialData = function() {
        var current = new Date();
        return _.chain(eventTypeList.eventtypes())
                .filter(function(type) { return type.plottable; })
                .map(function(type) {
                    return {
                        label: type.label,
                        values: [{ time: current, y: type.count }]
                    };
                }).value();
    };

    var chart = $('#area-chart').epoch({
        type: 'time.line',
        data: getInitialData(),
        windowSize: 100,
        axes: ['left', 'bottom'],
        ticks: { time: 10, left: 3},
    });

    var gauge = $('#gaugeChart').epoch({
        type: 'time.gauge',
        value: 0,
    });

    eventTypeList.eventtypes().forEach(function(type) {
        socket.on(type.name, function(event){
            type.increment();
            //var elem = document.getElementById("event-log");
            //var text = JSON.stringify(event, undefined, 2);

            //elem.innerHTML = text;
            //hljs.highlightBlock(elem);
        });
    });

    socket.on("info", function(info) {
        var maxInterval = 60 * 60 / info.ratelimit * 1000;
        var currentInterval = info.poll_interval;
        var remainingTime = new Date(info.reset) - new Date();

        var requestsRemaining = info.remaining;
        var requestsTodo = Math.floor(remainingTime / maxInterval);
        var currentUsage = requestsTodo / requestsRemaining;
      
        var requestsMade = (new Date() - start) / currentInterval;
        var maxEvents = Math.floor(requestsMade * 30);
        var currentEvents = _.chain(eventTypeList.eventtypes())
                    .map(function(type) { return type.allCount(); })
                    .reduce(function(memo, count) { return memo + count; }, 0)
                    .value();
        gauge.push(currentEvents / maxEvents);
    });


    window.setInterval(function() {
        var current = new Date();
        var lapse = new Date(start - current);
        var dataPoint = _.chain(eventTypeList.eventtypes())
                         .filter(function(type) { return type.plottable; })
                         .map(function(type) {
                            var count = type.count;
                            type.clear();
                            return { time: current, y: count };
                         }).value();
        chart.push(dataPoint);
    }, 1000);
});
