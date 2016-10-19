'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.findAndPrepareLogPath = findAndPrepareLogPath;
exports.findLogPath = findLogPath;
exports.findSystemAppPrefix = findSystemAppPrefix;
exports.prepareDir = prepareDir;
exports.prepareFile = prepareFile;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _touch = require('touch');

var _touch2 = _interopRequireDefault(_touch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Find and prepare a log path.
 */
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
 *
 *
 * Get the root for an application's system-specific logging directory.
 *
 * On Mac this should look like ~/Library/Application Support/${AppName}/
 * On Windows this should look like /Username/AppData/${AppName}
 * On Linux this could be any number of locations...
 *
 * Much of this code was pulled directly from `electron-log`,
 * also licensed under MIT.
 * https://github.com/megahertz/electron-log
 */
function findAndPrepareLogPath(appName, logParts, callback) {
  return findLogPath(appName, logParts, function (err, logpath) {
    if (err) {
      return callback(err);
    }

    return prepareFile(logpath, function (err, path) {
      return callback(err, path);
    });
  });
}

/**
 * Find a log path. Returns a pathname to an application and
 * system-specific log directory, including custom log parts that
 * are passed in. The last `logPart` is the filename and the first
 * `logParts` are directories.
 */
function findLogPath(appName, logParts, callback) {
  if (!appName) {
    throw new Error('application name required');
  }

  return findSystemAppPrefix(appName, function (err, systemAppPrefix) {
    if (err) {
      return callback(err);
    }

    return callback(null, _path2.default.join.apply(_path2.default, [systemAppPrefix].concat((0, _toConsumableArray3.default)(logParts))));
  });
}

/**
 * Find system-specific application prefixed directory.
 */
function findSystemAppPrefix(appName, callback) {
  if (!appName) {
    throw new Error('application name required');
  }

  if (process.platform === 'linux') {
    return prepareDir(process.env['XDG_CONFIG_HOME'], appName).or(process.env['HOME'], '.config', appName).or(process.env['XDG_DATA_HOME'], appName).or(process.env['HOME'], '.local', 'share', appName).result(callback);
  } else if (process.platform === 'darwin') {
    return prepareDir(process.env['HOME'], 'Library', 'Logs', appName).or(process.env['HOME'], 'Library', 'Application Support', appName).result(callback);
  } else if (process.platform === 'win32') {
    return prepareDir(process.env['APPDATA'], appName).or(process.env['USERPROFILE'], 'AppData', 'Roaming', appName).result(callback);
  }

  throw new Error('Unsupported platform: ' + process.platform);
}

/**
 * Async version of the same from electron-log.
 */
function prepareDir() {
  function _result(isFile, callback) {
    if (res.argStack.length === 0) {
      return callback(new Error('could not prepare any directories'));
    }

    var nextArgs = res.argStack.shift();
    var p = _path2.default.join.apply(_path2.default, (0, _toConsumableArray3.default)(nextArgs));
    var dirname = isFile ? _path2.default.dirname(p) : p;
    (0, _mkdirp2.default)(dirname, function (err) {
      if (!err) {
        if (!isFile) {
          return callback(null, p);
        }

        return (0, _touch2.default)(p, function (err) {
          if (!err) {
            return _fs2.default.access(p, _fs2.default.constants.W_OK, function (err) {
              if (!err) {
                return callback(null, p);
              }

              return _result(callback);
            });
          }

          return _result(callback);
        });
      }

      return _result(callback);
    });
  }

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var res = {
    or: prepareDirNested,
    argStack: [args],
    result: function result(callback) {
      return _result(false, callback);
    },
    fileResult: function fileResult(callback) {
      return _result(true, callback);
    }
  };

  function prepareDirNested() {
    for (var _len2 = arguments.length, argsNested = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      argsNested[_key2] = arguments[_key2];
    }

    res.argStack.push(argsNested);
    return res;
  }

  return res;
}

function prepareFile(path, callback) {
  return prepareDir(path).fileResult(callback);
}