// argv: <testDir> <fileending>
const fs = require('fs');
const path = require('path');

const Mocha = require('mocha');
const decache = require('decache');

const argv = require('optimist').parse(nw.App.fullArgv);
const testDir = argv._[0];
const fileEnding = argv._[1];

var win = nw.Window.get();

var mainWindowLoaded = false;
var runnerEventsBound = false;

function initTestWindow () {
  
  var body, iframe;

  if (!window) {
    return;
  }
  
  iframe = window.document.createElement('IFRAME');
  iframe.id = 'test-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = 0;
  iframe.style.left = 0;
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  body = window.document.getElementsByTagName('body')[0];  
  body.appendChild(iframe);
}


function getTestWindow () {

  var iframe;
  
  if (window) {
    iframe = window.document.getElementById('test-iframe');
    return iframe ? iframe.contentWindow : null;
  }

  return null;
}


function addTests (dirname, callback) {
  
  const feLength = fileEnding.length;

  const mocha = new Mocha();

  // mocha.reporter('loca');
  mocha.reporter('spec');

  // https://github.com/mochajs/mocha/issues/445
  mocha.suite.on('pre-require', function(context, file) {
    decache(file);
  });

  // Add each .js file to the mocha instance
  fs.readdirSync(testDir).filter(function(file){
      // Only keep the files end with fileEnding
      return file.substr(-feLength) === fileEnding;
  }).forEach(function(file){
      mocha.addFile(
          path.join(testDir, file)
      );
  });

  // call mocha to load the files (and scan them for tests)
  mocha.loadFiles(function () {

      // upon completion list the tests found
      const testWindow = getTestWindow();

      console.log('testWindow OK:', 'object' === typeof testWindow);

      mocha.suite.ctx.window = testWindow;
      mocha.suite.ctx.getWindow = getTestWindow;

      callback(null, mocha);
  });
}


function runTests (mocha, callback) {
  
  // Run the tests.
  var runner = mocha.run(function (failures) {
    console.log('runner finished', failures);
    callback();
  });

  // "reporter"
  if (!runnerEventsBound) {

    runner.on('pass', function (test) {
      console.log('%s passed', test.fullTitle());
    });

    runner.on('fail', function (test) {
      console.log('%s failed', test.title, test.err, test.body);
    });   

    runner.on('end', function () {
      console.log('test stats', this.stats);
    }); 

    runnerEventsBound = true;
  }
}


win.on('loaded', function () {

  if (!mainWindowLoaded) {

    mainWindowLoaded = true;
    
    // prepare main test window
    win.x = 1;
    win.y = 1;
    // win.maximize();
    win.showDevTools();

    initTestWindow();

    addTests(testDir, function (err, mocha) {
      runTests(mocha, function () {
        console.log('all done');
      });
    });
  }
});