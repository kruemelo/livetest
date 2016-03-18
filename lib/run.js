const path = require('path');
const spawn = require('child_process').spawn;
const npm = require('npm');

module.exports = function (options) {
  
  'use strict';
    
  npm.load({}, function (err) {
  
    if (err) { 
      console.error(err);
      return; 
    }

    npm.commands.bin(function (err, npmBinPath) {

      if (err) { 
        console.error(err);
        return; 
      }

      const nwBinFilename = path.join(npmBinPath, 'nw');

      console.log('nwBinFilename: "%s"', nwBinFilename);

      npm.commands.root(function (err, npmRootPath) {

        var basePath;

        if (err) { 
          console.error(err);
          return; 
        }

        basePath = path.join(npmRootPath, '..');
        console.log('npm root path: "%s", basePath="%s"', npmRootPath, basePath);

        try {

          var configFilename = options.config || './test/config.json';

          const ps = spawn(nwBinFilename, 
            [
              __dirname,
              basePath,
              configFilename
            ],
            {
              cwd: basePath
            }
          );

          ps.stdout.on('data', data => {
            console.log(data.toString('utf8'));
          });

          ps.on('error', err => {
            console.error(err);
          });

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

      }); // npm root path
    }); // npm bin path
  }); // npm load
};