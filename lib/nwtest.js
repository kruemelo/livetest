// argv: <testDir> <fileending>
(function () {

  const fs = require('fs');
  const path = require('path');

  // const Mocha = require('mocha');
  // const decache = require('decache');

  const argv = require('optimist').parse(nw.App.fullArgv);
  const testDir = argv._[0];
  const fileEnding = argv._[1];

  // nw window
  var win = nw.Window.get();

  var mainWindowLoaded = false;
  var testWindowLoaded = false;

  // get main window
  function getWindow () {
    var mainWindow = win.window;
    mainWindow.isMainWindow = true;
    return mainWindow;
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
    const mocha = new Mocha();

    mocha.ui('bdd');
    mocha.reporter('spec');
    // mocha.reporter(require('loca'));

    callback(mocha);

    // exports.afterEach = context.afterEach || context.teardown;
    // exports.after = context.after || context.suiteTeardown;
    // exports.beforeEach = context.beforeEach || context.setup;
    // exports.before = context.before || context.suiteSetup;
    // exports.describe = context.describe || context.suite;
    // exports.it = context.it || context.test;
    // exports.setup = context.setup || context.beforeEach;
    // exports.suiteSetup = context.suiteSetup || context.before;
    // exports.suiteTeardown = context.suiteTeardown || context.after;
    // exports.suite = context.suite || context.describe;
    // exports.teardown = context.teardown || context.afterEach;
    // exports.test = context.test || context.it;
    // exports.run = context.run;

    // const mainWindow = getWindow();
    // const headEl = mainWindow.document.getElementsByTagName('head')[0];
    // var scriptTag;

    // const tmpGlobal = global;
    // global = mainWindow;

    // scriptTag = mainWindow.document.createElement('SCRIPT');
    // scriptTag.src = 'file://' + path.join(nw.__dirname, 'mocha.js');
    // headEl.appendChild(scriptTag);

    // setTimeout(function () {


    //   const mocha = mainWindow.mocha; // global.mocha; //  new Mocha();

    //   mocha.setup('bdd');
    //   mocha.reporter('spec');

    //   global = tmpGlobal;

    //   mainWindow.console.log(mainWindow.describe);
    //   // mocha.reporter(require('loca'));

    //   callback(mocha);
    // }, 500);

  }


  function addTests (mocha, dirname, callback) {
    
    const feLength = fileEnding.length;
    const mainWindow = getWindow();
    const testWindow = getTestWindow();    
    const headEl = mainWindow.document.getElementsByTagName('head')[0];
    var scriptTag;

    // https://github.com/mochajs/mocha/issues/445
    // if (nw.global.sessionStorage.testFilesLoaded) {
    //   mocha.suite.on('pre-require', function(context, file) {
    //     decache(file);
    //   });    
    // }

    // https://github.com/mochajs/mocha/issues/960
    // https://github.com/mochajs/mocha/issues/960#issuecomment-46750530   
    mocha.suite.emit('pre-require', mainWindow, null, mocha);

    // Add each .js file to the mocha instance
    fs.readdirSync(testDir).filter(function(file){
        // Only keep the files end with fileEnding
        return file.substr(-feLength) === fileEnding;
    }).forEach(function(file){

        // mocha.addFile(
        //     path.join(testDir, file)
        // );

        scriptTag = mainWindow.document.createElement('SCRIPT');
        scriptTag.src = 'file://' + path.join(testDir, file);
        headEl.appendChild(scriptTag);
    });

    // call mocha to load the files (and scan them for tests)
    mocha.loadFiles(function () {

        // upon completion list the tests found

        console.log('testWindow OK:', 'object' === typeof testWindow);

        // get main window
        mocha.suite.ctx.getWindow = getWindow;

        // get test window (iframe)
        mocha.suite.ctx.getTestWindow = getTestWindow;

        mocha.suite.ctx.dirname = dirname;

        // nw.global.sessionStorage.testFilesLoaded = true;
        
        setTimeout(function () {
          callback(null);
        }, 1000);

        // callback();
    });
  }


  function runTests (mocha, callback) {
    
    // Run the tests.
    var w = getWindow(),
      runner;

    // getWindow().console.log('runTests()');
    // mocha.suite.emit('pre-require', w, null, mocha);

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


  win.on('loaded', function () {

    getWindow().console.log('win.on loaded');

    if (!mainWindowLoaded) {

      mainWindowLoaded = true;
      
      // prepare main test window
      win.x = 1;
      win.y = 1;
      // win.maximize();
      win.showDevTools();

      initTestWindow();

    }
    else if (!testWindowLoaded) {
      testWindowLoaded = true;
      loadMocha(function (mocha) {
        addTests(mocha, testDir, function () {
            runTests(mocha, function () {
              getWindow().console.log('all done');
            });
        });
      });
    }
  });

}());