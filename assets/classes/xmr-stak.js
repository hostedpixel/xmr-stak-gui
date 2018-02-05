const spawn = require('child_process').spawn;
const os = require('os');
const path = require('path');
const fs = require('fs')
const debug = require('debug')('xmr-stak-gui-class-xmrStak');

class xmrStak {
    constructor() {}

    async launchXMR(args) {
        if (os.type() === "Linux") {
            debug('OS Type: Linux');
            debug(`Spawning child process xmr-stak with the parameters: ${args}`);
            var child = spawn(path.join(__dirname, '../xmr-stak/xmr-stak'), args, {
                shell: true
            });
            return child;

        } else if (os.type() === "Windows_NT") {
            debug('OS Type: Windows_NT');
            debug(`Spawning child process xmr-stak with the parameters: ${args}`);
            var child = spawn(path.join(__dirname, '../xmr-stak/xmr-stak.exe'), args, {
                shell: true
            });
            return child;
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
                    debug(`stdout: ${data}`);
                    var version = data.toString('utf8');
                    version = version.replace('Version: xmr-stak', '');
                    debug('Version:' + version);
                    $('#XMRVersion').text(`and xmr-stak: ${version},`);
                    return version;
                }, 1000);
            });

            child.stderr.on('data', function (data) {
                debug(`stderr: ${data}`);
            });
            child.on('close', function (code) {
                debug(`Closing code: ${code}`);
            });
            child.on('error', function (err) { // If xmr-stak cant be found
                $('#XMRVersion').text(` xmr-stak: Not Found,`);
            });
        }
    }

    async startMining(args) {
        const realThis = this; // used due to fs.readFile changing the context of this

        process.env.XMRSTAK_NOWAIT = true; // Remove the "Press any key to continue" on Windows.

        fs.readFile('./gui-config.txt', {
            encoding: 'utf-8'
        }, async function (err, config) {
            if (!err) {
                debug('Read config file:' + config);
                debug('converting string to array');
                config = config.split(","); // Convert config string into array
                debug('starting miner with config:' + config);
                
                var child = await realThis.launchXMR(config);
                if (child) { // child === false if launchXMR fails

                    child.stdout.on('data', function (data) {
                        debug(`stdout: ${data}`);
                    });

                    child.stderr.on('data', function (data) {
                        debug(`stderr: ${data}`);
                    });

                    child.on('close', function (code) {
                        debug(`Closing code: ${code}`);
                    });

                    child.on('error', function (err) { // If xmr-stak cant be found
                        $('#XMRVersion').text(` xmr-stak: Not Found,`);
                    });
                }
            }
        });

    }

    async download() { // Todo download latest pre-compiled xmr-stak

    }

}

module.exports = xmrStak;