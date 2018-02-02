var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var debug = require('debug')('xmr-stak-gui-class-xmrStak');

class xmrStak {
    constructor() {}

    async launchXMR(args) {
        if (os.type() === "Linux") {
            debug('OS Type: Linux');
            debug(`Spawning child process xmr-stak with the paramiters: ${args}`);
            var child = spawn(path.join(__dirname, '../xmr-stak/xmr-stak'), args);
            return child;

        } else if (os.type() === "Windows_NT") {
            debug('OS Type: Windows_NT');
            debug(`Spawning child process xmr-stak with the paramiters: ${args}`);
            var child = spawn(path.join(__dirname, '../xmr-stak/xmr-stak.exe'), args);
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
        process.env.XMRSTAK_NOWAIT = true; // Remove the "Press any key to continue" on Windows.

        var TLS;
        var nicehash;
        var currency;
        var poolAddress = $("#poolAddress").val();
        var poolUsername = $("#poolUsername").val();
        var poolPassword = $("#poolPassword").val();

        if ($("#radioMonero").is(':checked')) {
            debug('Using Monero');
            currency = `monero`
        } else {
            debug('Using Aeon');
            currency = `aeon`;
        }

        if ($("#TLS").is(':checked')) {
            debug('Using TLS');
            TLS = `-O`
        } else {
            debug('NOT Using TLS');
            TLS = `-o`
        }

        var config = [`--currency`, currency, TLS, poolAddress, `-u`, poolUsername, `-p`, poolPassword, '--noUAC', '--noNVIDIA'];

        if ($("#NiceHash").is(':checked')) {
            debug('Using NiceHash');
            config.push(`--nicehash`);
        } else {
            debug('NOT Using NiceHash');
        }

        var child = await this.launchXMR(config);
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

    async download() { // Todo download latest pre-compiled xmr-stak

    }

}

module.exports = xmrStak;