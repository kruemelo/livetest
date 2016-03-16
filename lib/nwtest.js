// argv: <testDir> <fileending>
const fs = require('fs');
const path = require('path');

const Mocha = require('mocha');
const decache = require('decache');

const argv = require('optimist').parse(nw.App.fullArgv);
const testDir = argv._[0];
const fileEnding = argv._[1];

// nw window
var win = nw.Window.get();

var mainWindowLoaded = false;
var runnerEventsBound = false;


// get main window
function getWindow () {
  return window;
}


function initTestWindow () {
  
  var body, 
    iframe, 
    w = getWindow();

  if (!w) {
    return;
  }
  
  iframe = w.document.createElement('IFRAME');
  iframe.id = 'test-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = 0;
  iframe.style.left = 0;
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  body = w.document.getElementsByTagName('body')[0];  
  body.appendChild(iframe);
}


// get test window (iframe)
function getTestWindow () {

  var iframe,
    w = getWindow();
  
  if (w) {
    iframe = w.document.getElementById('test-iframe');
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

      // get main window
      mocha.suite.ctx.getWindow = getWindow;

      // get test window (iframe)
      mocha.suite.ctx.getTestWindow = getTestWindow;

      callback(null, mocha);
  });
}


function runTests (mocha, callback) {
  
  // Run the tests.
  var w = getWindow(),
    runner = mocha.run(function (failures) {
      w.console.log('runner finished', failures);
      callback();
    });

  // "reporter"
  if (!runnerEventsBound) {

    runner.on('pass', function (test) {
      w.console.log('%s passed', test.fullTitle());
    });

    runner.on('fail', function (test) {
      w.console.log('%s failed', test.title, test.err, test.body);
    });   

    runner.on('end', function () {
      w.console.log('test stats', this.stats);
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
        getWindow().console.log('all done');
      });
    });
  }
});