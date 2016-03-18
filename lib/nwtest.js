// argv: <testDir> <fileending>
(function () {

  const fs = require('fs');
  const path = require('path');
  const async = require('async');
  const glob = require('glob');

  const argv = require('optimist').parse(nw.App.fullArgv);

  process.chdir(argv._[0]);

  var configFilename = argv._[1];
  var config;
  var testFiles = [];

  if (configFilename) {
    if (!path.isAbsolute(configFilename)) {
      configFilename = path.join(process.cwd(), configFilename);
    }       
    config = JSON.parse(fs.readFileSync(configFilename, 'utf8'));
  }
  else {
    throw new Error('no config file');
  }

  var mocha;

  // nw window
  const win = nw.Window.get();

  // get main window
  function getWindow () {
    var mainWindow = win.window;
    mainWindow.isMainWindow = true;
    return mainWindow;
  }


  function initTestWindow (callback) {
    
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

    callback();
  }


  // get test window (iframe)
  function getTestWindow () {

    var iframe,
      w = getWindow(),
      testWindow = null;
    
    if (w) {
      iframe = w.document.getElementById('test-iframe');
      if (iframe) {
        testWindow = iframe.contentWindow;
        testWindow.isTestWindow = true;
      }
    }

    return testWindow;
  }


  function loadMocha (callback) {

    const Mocha = require('mocha');
    mocha = new Mocha();

    mocha.ui('bdd');
    // mocha.reporter('spec');

    callback();
  }


  function addTests (filename, callback) {
    
    const mainWindow = getWindow();
    // const testWindow = getTestWindow();    
    const headEl = mainWindow.document.getElementsByTagName('head')[0];
    var scriptTag;

    // https://github.com/mochajs/mocha/issues/960
    // https://github.com/mochajs/mocha/issues/960#issuecomment-46750530   
    mocha.suite.emit('pre-require', mainWindow, null, mocha);

    mainWindow.__filename = filename;
    mainWindow.__dirname = path.dirname(filename);

    scriptTag = mainWindow.document.createElement('SCRIPT');
    scriptTag.src = 'file://' + filename;
    headEl.appendChild(scriptTag);

    // call mocha to load the files (and scan them for tests)
    mocha.loadFiles(function () {
        // console.log('testWindow OK:', 'object' === typeof testWindow);
        // get main window
        mocha.suite.ctx.getWindow = getWindow;

        // get test window (iframe)
        mocha.suite.ctx.getTestWindow = getTestWindow;

        mocha.suite.ctx.filename = filename;
        
        setTimeout(function () {
          callback(null);
        }, 200);
    });
  }


  function runTests ( callback) {
    
    // Run the tests.
    var w = getWindow(),
      runner;

    runner = mocha.run(function (failures) {

      process.on('exit', function () {
        process.exit(failures);  // exit with non-zero status if there were failures
      });

      w.console.log('runner finished', failures);
      callback();
    });

    // "reporter"
    runner.on('pass', function (test) {
      w.console.log('%s passed', test.fullTitle());
    });

    runner.on('fail', function (test) {
      w.console.log('%s failed', test.title, test.err, test.body);
    });   

    runner.on('end', function () {
      w.console.log('test stats', this.stats);
    }); 

  }

  function waitFor (predicate, callback) {

    var intervalID = setInterval(() => {
      if (predicate()) {
        clearInterval(intervalID);
        callback();
      }
    }, 50);

    return this;
  }


  async.series([
    
    (waitNwWinLoaded) => {
      setTimeout(waitNwWinLoaded, 500);
    },

    (setupNwWinDone) => {
      // prepare main test window
      win.x = 1;
      win.y = 1;
      // win.maximize();
      win.showDevTools();      
      setupNwWinDone();
    },

    (initTestWindowDone) => {
      initTestWindow(initTestWindowDone);
    },

    (waitTestWindowLoaded) => {
      waitFor(getTestWindow, waitTestWindowLoaded);
    },

    (loadMochaDone) => {
      loadMocha(loadMochaDone);
    },

    (getTestFilenamesDone) => {
      // get test filenames
      const globOptions = {
        root: process.cwd(), 
        nodir: true, 
        realpath: true
      };
      async.eachSeries(
        config.files,
        (pattern, done) => {
          // https://www.npmjs.com/package/glob
          const filenames = glob.sync(pattern, globOptions);
          filenames.forEach((filename) => {
            // if (!path.isAbsolute(filename)) {
            //   filename = path.join(process.cwd(), filename);
            // } 
            if (!testFiles.includes(filename)) {
              testFiles.push(filename);
            }
          });
          done();
        },
        getTestFilenamesDone
      );      
    },

    (testFilesDone) => {

      if (!testFiles.length) {
        console.warn('no test files found');
        return testFilesDone();
      }

      async.eachSeries(
        testFiles,
        (testFilename, testFileDone) => {    
          // run mocha for each test file
          mocha.suite.suites.length = 0;
          addTests(testFilename, () => {
            runTests(testFileDone);
          });
        },
        testFilesDone
      );
    }

  ]);

}());