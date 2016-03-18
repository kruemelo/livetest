;(function () {
  
  const path = require('path');
  const assert = require('chai').assert;

  function prepareEnv (testWindow, testPath, callback) {

    function awaitLoaded (loadingDone) {
      setTimeout(function () {
        if (testWindow.document.getElementById('btn-clickme')) {
          return loadingDone();
        }
        awaitLoaded(loadingDone);
      }, 500);
    }

    testWindow.location.assign(`file://${testPath}/test1.html`);
    awaitLoaded(callback);
  }


  describe('test 1 suite', function () {

    var w,
      testPath;

    const thisSuite = this;

    before(function (done) {

      this.timeout(3000);

      w = thisSuite.ctx.getTestWindow();

      if (!w) {
        throw new Error('now test window available');
      }

      // testPath = path.dirname(thisSuite.file);
      testPath = thisSuite.ctx.dirname;

      prepareEnv(w, testPath, done);
    });


    it('should self-test suite', function () {
      assert.isObject(thisSuite, 'should have suite');
      assert.isArray(thisSuite.tests, 'should have tests');
      assert.isFunction(thisSuite.ctx.getWindow, 'should have suite getWindow()');
      assert.isFunction(thisSuite.ctx.getTestWindow, 'should have suite getTestWindow()');
    });

    it('should self-test test', function () {
      assert.isObject(this, 'should have this');
      assert.isObject(this.test, 'should have test');
    });

    it('should have window context', function (done) {
      assert.isFunction(this.test.ctx.getWindow, 'should have ctx.getWindow');
      assert(this.test.ctx.getWindow(), 'should execute ctx.getWindow');
      assert.isFunction(this.test.ctx.getTestWindow, 'should have ctx.getTestWindow');
      assert(this.test.ctx.getTestWindow(), 'should execute ctx.getTestWindow');
      done();
    });
    
    it('should pass', function (done) {
      setTimeout(function () {
          done();
      }, 100);
    });

    it('should fail', function (done) {
    	assert.equal('a', 'b');
      done();
    });
    
    it.skip('should skip', function (done) {
      done();
    });

    describe('inner', function () {

      it('should pass', function (done) {
        setTimeout(function () {
          done();
        }, 50);
      });

      it('should fail', function (done) {
        done(new Error('Something bad happened!'));
      });

      it.skip('should skip', function (done) {
        done();
      });

      xit('should access test window dom els', function (done) {

        var btn = w.document.getElementById('btn-clickme'),
          divResult = w.document.getElementById('result');

        btn.click();

        assert.strictEqual(divResult.innerHTML, 'yay!');

        done();
      });

    });

  });

}());