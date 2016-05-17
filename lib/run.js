// run
// $ DEBUG=livetest.run npm test
const debug = require('debug')('livetest.run');
const spawn = require('child_process').spawn;
const path = require('path');
const os = require('os');
const nw = require('nw');

module.exports = function (options) {
  
  'use strict';

  try {

    const args = [];
    const cwd = process.cwd();

    debug('process.cwd', cwd);

    debug('livetest options');
    console.dir(options.rawArgs);

    const nwBinFilename = nw.findpath();
    debug('nw bin "%s"', nwBinFilename);

    // set cwd on startup
    args.push(__dirname);

    // set cwd relative to test files
    args.push(cwd);

    // set config filename
    const configFilename = options.config || './test/config.json';
    args.push(configFilename);

    // user data dir
    var userDataDir  = options.userDataDir;

    if (userDataDir) {
      if (!path.isAbsolute(userDataDir)) {
        userDataDir = path.join(os.tmpdir(), userDataDir);
      }
      args.push('--user-data-dir=' + userDataDir);
    }

    const ps = spawn(
      nwBinFilename, 
      args
    );

    ps.on('close', (code, signal) => {
      console.log('nw close', code, signal);
      if (code) {
        throw new Error('livetest exited with code ' + code);
      }
    });   

  } catch (e) {
    console.error(e);
    console.log(e.stack);
  }
};