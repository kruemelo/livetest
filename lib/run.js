const path = require('path');
const spawn = require('child_process').spawn;
const nwBinFilename = path.join(process.cwd(), 'node_modules/.bin/nw');

module.exports = function (options) {
	
	'use strict';
	
  try {

  	console.log('nwBinFilename: "%s"', nwBinFilename);

		var testDir = options.path || 'test';
		if (!path.isAbsolute(testDir)) {
			testDir = path.join(process.cwd(), testDir);
		}
		const fileEndings = options.end || '.js';

		const ps = spawn(nwBinFilename, 
			[
				__dirname,
				testDir,
				fileEndings
			], 
			{
				cwd: path.join(__dirname, '..')
			}
		);

		console.log(
			'running livetests at "%s" with file endings "%s" ..', 
			testDir, fileEndings
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
};