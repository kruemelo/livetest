
const fs = require('fs');
const http = require('http');
const assert = require('chai').assert;

const hostname = '127.0.0.1';
const port = 1337;
var server = null;

console.log('specs at %s', __filename);

function prepareEnv (testWindow, callback) {

  function awaitLoaded (loadingDone) {
    setTimeout(function () {
      if (testWindow && testWindow.document.getElementById('btn-yay')) {
        return loadingDone();
      }
      awaitLoaded(loadingDone);
    }, 500);
  }

  if (server) {
    testWindow.location.assign(`http://${hostname}:${port}/`);
    awaitLoaded(callback);
  }
  else {
    // startup test http server
    server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(fs.readFileSync('test.html'));
    }).listen(port, hostname, () => {
      testWindow.location.assign(`http://${hostname}:${port}/`);
      awaitLoaded(callback);
    });
  }

}


describe('test suite', function () {

  var w;

  const thisSuite = this;

  before(function (done) {

    this.timeout(3000);

    w = thisSuite.ctx.window;

    if (!w) {
      throw new Error('now test window available');
    }

    prepareEnv(w, done);
  });

  after(function (done) {
    this.timeout(4000);
    if (server) {
      server.close(done);
    }
    else {
      done();
    }
  });

  it('should self-test suite', function () {
    assert.isObject(thisSuite, 'should have suite');
    assert.isArray(thisSuite.tests, 'should have tests');
    assert.isFunction(thisSuite.ctx.getWindow, 'should have suite getWindow()');
  });

  it('should self-test test', function () {
    assert.isObject(this, 'should have this');
    assert.isObject(this.test, 'should have test');
  });

  it('should have window context', function (done) {
    assert(this.test.ctx.window, 'should have ctx.window');
    assert.isFunction(this.test.ctx.getWindow, 'should have ctx.getWindow');
    assert(this.test.ctx.getWindow(), 'should execute ctx.getWindow');
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

    it('should access test window dom els', function (done) {

      var btn = w.document.getElementById('btn-yay'),
        divResult = w.document.getElementById('result');

      btn.click();

      assert.strictEqual(divResult.innerHTML, 'as a result');

      done();
    });

  });

});