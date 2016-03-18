
const path = require('path');
const assert = require('chai').assert;

function prepareEnv (testWindow, testPath, callback) {

  function awaitLoaded (loadingDone) {
    setTimeout(function () {
      if (testWindow.document.getElementById('text')) {
        return loadingDone();
      }
      awaitLoaded(loadingDone);
    }, 500);
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

    testPath = path.dirname(thisSuite.file);

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