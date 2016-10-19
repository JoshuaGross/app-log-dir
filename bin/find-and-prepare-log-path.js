#!/usr/bin/env node --harmony
/**
 * Copyright (C) 2016 Swift Navigation Inc.
 * Copyright (c) 2016 Alexey Prokhorov (original code from electron-log)
 * Contact: Joshua Gross <josh@swift-nav.com>
 * This source is subject to the license found in the file 'LICENSE' which must
 * be distributed together with this source. All other rights reserved.
 *
 * THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
 * EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
 */

var program = require('commander');
var pkg = require('../package.json');
var lib = require('../lib');
var findAndPrepareLogPath = lib.findAndPrepareLogPath;

program
  .version(pkg.version)
  .command('find-and-prepare-log-path <appName> [...logParts]', 'find and create directories for a log path, prefixed under `appName`, and using `logParts` as parts of the log filename')
  .action(function () {
    var args = Array.prototype.slice.call(arguments);
    var appName = args[0];
    var logParts = args.slice(1).filter(function (s) {
      return typeof s === 'string';
    });

    return findAndPrepareLogPath(appName, logParts, function (err, path) {
      if (err) {
        console.log('Error:', err);
        process.exit(-1);
      }

      console.log(path);
      process.exit(0);
    });
  })
  .parse(process.argv);
