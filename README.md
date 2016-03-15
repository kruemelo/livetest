
run mocha tests in nwjs window

# Install

```bash
npm i livetest --save-dev
```

# Usage

```bash

$ node livetest -h

## Help

```bash
$ livetest -h
  Usage: livetest [options]

  Run livetests in a directory

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -t, --path <testdir>    Run live tests in a directory, default: "test" - relative to cwd
    -e, --end <fileending>  test filename endig, default: ".js"

  Examples:

    $ livetest
    $ livetest --path=test/specs
    $ livetest --end=Spec.js

```

## License
MIT &copy; [kruemelo](https://github.com/kruemelo)
