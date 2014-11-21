var dns = require('dns');
var os = require('os');

module.exports = function(client, port) {
    var connectionInfo = function(callback) {
        dns.lookup(os.hostname(), function (err, addr, fam) {
            callback({
                "address": addr,
                "hostname": os.hostname(),
                "port": port,
            });
        });
    };

    return {
        getInfo: function(req, res) {
            connectionInfo(function(connInfo) {
                res.json({
                    'connection': connInfo,
                    'client': client.getInfo(),
                });
            });
        }
    };
};
