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



    }

    async download() {
        var https = require('follow-redirects').https
        var fs = require('fs')

        const githubReleases = {
            hostname: 'api.github.com',
            path: '/repos/fireice-uk/xmr-stak/releases',
            headers: {
                'User-Agent': 'xmr-stak-gui'
            }
        };

        https.get(githubReleases, function (res) {
            var body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                debug(body);
                var githubResponse = JSON.parse(body);
                debug(githubResponse[0].assets[0].browser_download_url)
                var file = fs.createWriteStream("./assets/xmr-stak/xmr-stak.zip");
                https.get(githubResponse[0].assets[0].browser_download_url, function (res) {
                    console.log(res)
                    res.pipe(file);
                    res.on('end', function () {
                        debug('Downloaded xmr-stak-win64.zip');
                    });
                });
            });
        }).on('error', function (e) {
            debug("Got an error: ", e);
        });
    }

}

module.exports = xmrStak;