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
                shell: true,
                cwd: './assets/configs/'
            });
            return child;

        } else if (os.type() === "Windows_NT") {
            debug('OS Type: Windows_NT');
            debug(`Spawning child process xmr-stak with the parameters: ${args}`);
            var child = spawn(path.join(__dirname, '../xmr-stak/xmr-stak.exe'), args, {
                shell: true,
                cwd: './assets/configs/'
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
                    $('#XMRVersion').text(`, xmr-stak: ${version},`);
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

        fs.readFile('./assets/configs/gui-config.txt', {
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

                        if(data.toString().includes('Pool logged in.')){ // Look for a successful start and alert user
                            debug('Pool logged in, successful start!');
                            $('#minerStatus').text('STARTED');
                            $('#minerStatusAlert').removeClass('alert-warning').addClass('alert-success');
                        }
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

    async parseOutput(){

    }

    // Reads the cpu.txt file, attempts to find the config at the bottom of the file using the regex, fixes some of the default output which is not valid JSON and then converts it into a JSON array
    async loadCPUConfig(){
        fs.readFile('./assets/configs/cpu.txt', {encoding: 'utf-8'}, function(err,data){
            if (!err) {
                debug('Read cpu config, extracting data now');
                debug(data);
                var configRegex = /\[\r\n    [{ "a-z_:,0-9}\r\n]*\r\n],/g // Regex to extract the config array from the file
                var config = configRegex.exec(data);
                debug(config[0]);
                config = config[0].replace('},\r\n],', '}]');
                debug(config)
                config = JSON.parse(config);
                debug(config);
                debug('Core Count: ' + config.length);
                return config;
            } else {
                debug(err);
                return false;
            }
        });
    }
}

module.exports = xmrStak;