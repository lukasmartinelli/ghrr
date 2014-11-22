var EventTypeList = function() {
    var types = [
         { name: 'pushevent', label: 'push', color: '#1f77b4', plottable: true },
         { name: 'issuecommentevent', label: 'issue comment',
           color: '#ff7f0e', plottable: true},
         { name: 'createevent', label: 'create',
           color: '#2ca02c', plottable: true},
         { name: 'watchevent', label: 'watch',
           color: '#d62728', plottable: true },
         { name: 'pullrequestevent', label: 'pull request',
           color: '#9467bd', plottable: true},
         { name: 'issuesevent', label: 'issues',
           color: '#8c564b', plottable: true},
         { name: 'pullrequestreviewcommentevent', label: 'review comment',
           color: '#e377c2', plottable: true},
         { name: 'deleteevent', label: 'delete',
           color: '#7f7f7f', plottable: true },
         { name: 'forkevent', label: 'fork', color: '#bcbd22', plottable: true },
         { name: 'commitcommentevent', label: 'commit comment'},
         { name: 'followevent', label: 'follow'},
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

    var EventType = function(name, label, plottable, color) {
        this.name = name;
        this.label = label;
        this.count = 0;
        this.allCount = ko.observable(0);
        this.startDate = new Date();
        this.updateDate = ko.observable(new Date());
        this.plottable = plottable;
        this.color = color;
        this.resets = 0;

        this.countPerSecond = ko.computed(function() {
            var diff = (this.updateDate() - this.startDate) / 1000;
            var avg = this.allCount() / diff;
            return isNaN(avg) || !isFinite(avg) ? 0 : avg.toFixed(2);
        }.bind(this));

        this.increment = function(count) {
            this.updateDate(new Date());
            this.count += count;
            this.allCount(this.allCount() + count);
        };

        this.reset = function() {
            this.resets += 1;
            if(this.resets % 10 == 0) {
                this.startDate = new Date();
                this.allCount(0);
            }
            this.count = 0;
        }
    };

    var eventTypes = _.map(types, function(type) {
        return new EventType(type.name, type.label,
                             type.plottable || false,
                             type.color || '#759BB3');
    });

    return {
        types: ko.observableArray(eventTypes)
    }
};
