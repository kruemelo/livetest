
run mocha tests in nwjs window

current version installs nwjs 0.14.5 sdk

## Install

```bash
npm i livetest --save-dev
```

## Usage

```bash
$ node livetest --config=./test/config.json
```

## Test

```bash
$ npm test 
```

## Help

```bash
$ livetest -h
  Usage: livetest [options]

  Run livetests in a directory

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -c, --config <testdir>  test config filename, default: ./test/config.json

  Examples:

    $ livetest
    $ livetest --config=./test/config.json

```

## Config file

```
{
  "files": [
    "test/test1Spec.js",
    "./test/**/*Spec.js"
  ]
}
```

## License
MIT &copy; [kruemelo](https://github.com/kruemelo)
