var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var debug = require('debug')('xmr-stak-gui-class-xmrStak')

class xmrStak {
    constructor() {}

    async launchXMR(args) {
        if (os.type() === "Linux") {
            debug('OS Type: Linux');
            debug(`Spawning child process xmr-stak with the paramiters: ${args}`);
            var child = spawn(path.join(__dirname, '../xmr-stak/xmr-stak'), args);
            return child

        } else if (os.type() === "Windows_NT") {
            debug('OS Type: Windows_NT');
            debug(`Spawning child process xmr-stak with the paramiters: ${args}`);
            var child = spawn(path.join(__dirname, '../xmr-stak/xmr-stak.exe'), args);
            return child
        } else {
            debug('Failed to launch xmr-stak. Your OS is not supported');
            return false;
        }
    }

    async getVersion() {
        var child = await this.launchXMR([`--version`]);
        if (child) { // child === false if launchXMR fails

            child.stdout.on('data', function (data) {
                setTimeout(function () { // Wait a second for the full chunk of data
                    debug('stdout: ' + data);
                    var version = data.toString('utf8');
                    version = version.replace('Version: xmr-stak', '');
                    debug('Version:' + version);
                    $('#XMRVersion').text(`and xmr-stak: ${version}`);
                    return version;
                }, 1000);
            });

            child.stderr.on('data', function (data) {
                debug('stderr: ' + data);
            });
            child.on('close', function (code) {
                debug('closing code: ' + code);
            });
            child.on('error', function (err) { // If xmr-stak cant be found
                $('#XMRVersion').text(`and xmr-stak: Not Found`);
            });
        }

    }

}

module.exports = xmrStak;