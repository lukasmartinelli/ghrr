var CBuffer = require('CBuffer');

var buffer = new CBuffer(5);
buffer.fill({});

module.exports = {
    isUnique: function(event) {
        hasDuplicates = buffer.some(function(ids) {
            var exists = event.id in ids;
            ids[event.id] = true;
            return exists;
        });
        return !hasDuplicates;
    },
    discardOldest: function() {
        buffer.push({});
    }
};
