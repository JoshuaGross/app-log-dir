# app-log-dir
Node.js: get system-specific application logging directories. Supports Windows, Linux, Mac.

# example
## Create a logger
```javascript
var findAndPrepareLogPath = require('app-log-dir').findAndPrepareLogPath;

findAndPrepareLogPath('myAppName', ['prefixed', 'log', 'directory', 'log1.txt'], function (err, logpath) {
  if (err) {
    console.log('Could not get log path - critical error!');
    process.exit(-1);
  }

  var logger = fs.createWriteStream(logpath);
  logger.write('Application started\n');

  // continue ...
});
```

# methods
```javascript

var lib = require('app-log-dir');

// Find and prepare log path - recursively create directories
var findAndPrepareLogPath = lib.findAndPrepareLogPath

findAndPrepareLogPath('AppName', ['my-app-logs', Date.now(), 'log.txt'], function (err, path) {
  // ...
});

// Find log path - return path to log without doing anything to the filesystem
var findLogPath = lib.findLogPath;

findLogPath('AppName', ['my-app-logs', Date.now(), 'log.txt'], function (err, path) {
  // ...
});

// Find system app prefix, without constructing full path to a particular logfile
var findSystemAppPrefix = lib.findSystemAppPrefix;

findSystemAppPrefix('AppName', function (err, path) {
  // ...
});
```

# usage

This package also ships with three commands:

```
  Usage: find-system-app-prefix [options] [command]


  Commands:

    find-system-app-prefix <appName>  find directories for a log path, prefixed under `appName`
    help [cmd]                        display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

example: 

```
$ find-system-app-prefix MyAppName
< /Users/joshuagross/Library/Logs/MyAppName
```

```
  Usage: find-log-path [options] [command]


  Commands:

    find-log-path <appName> [...logParts]  find directories for a log path, prefixed under `appName`, and using `logParts` as parts of the log filename
    help [cmd]                             display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

example:

```
$ find-log-path MyAppName path to prefixed log file log.txt
/Users/joshuagross/Library/Logs/MyAppName/path/to/prefixed/log/file/log.txt
```

```
  Usage: find-and-prepare-log-path [options] [command]


  Commands:

    find-and-prepare-log-path <appName> [...logParts]  find and create directories for a log path, prefixed under `appName`, and using `logParts` as parts of the log filename
    help [cmd]                                         display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

example:

```
$ find-and-prepare-log-path MyAppName path to prefixed log file log.txt
/Users/joshuagross/Library/Logs/MyAppName/path/to/prefixed/log/file/log.txt
```

# License

Released under MIT license.
