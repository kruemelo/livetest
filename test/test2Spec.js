;(function () {
 
  const path = require('path');
  const assert = require('chai').assert;

  console.log(
    'process.cwd: %s, __dirname: %s, __filename: %s',
    process.cwd(), __dirname, __filename
  );

  function prepareEnv (testWindow, testPath, callback) {

    function awaitLoaded (loadingDone) {
      var intervalID = setInterval(() => {
        if (testWindow.document && testWindow.document.getElementById('text')) {
          clearInterval(intervalID);
          loadingDone();
        }
      }, 100);
    }

    testWindow.location.assign(`file://${testPath}/test2.html`);
    awaitLoaded(callback);
  }


  describe('test 2 suite', function () {

    var w,
      mainWindow,
      testPath;

    const thisSuite = this;

    before(function (done) {

      this.timeout(2000);

      mainWindow = thisSuite.ctx.getWindow();
      w = thisSuite.ctx.getTestWindow();

      if (!w) {
        throw new Error('now test window available');
      }

      testPath = path.dirname(thisSuite.ctx.filename);

      prepareEnv(w, testPath, done);
    });


    it('should input text', function (done) {
        var text = w.document.getElementById('text'),
          divResult = w.document.getElementById('result');

        mainWindow.console.log(text, divResult);

        text.addEventListener('click', function () {
          mainWindow.console.log('click', this);
          divResult.innerHTML = this.value;
        });

        text.value = 'test text';
        text.click();

        setTimeout(function () {
          assert.strictEqual(divResult.innerHTML, 'test text');
          done();
        }, 200);
    });

  });
  
}());