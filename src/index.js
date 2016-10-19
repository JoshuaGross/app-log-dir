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
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import touch from 'touch';

/**
 * Find and prepare a log path.
 */
export function findAndPrepareLogPath (appName, logParts, callback) {
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
export function findLogPath (appName, logParts, callback) {
  if (!appName) {
    throw new Error('application name required');
  }

  return findSystemAppPrefix(appName, function (err, systemAppPrefix) {
    if (err) {
      return callback(err);
    }

    return callback(null, path.join(systemAppPrefix, ...logParts));
  });
}

/**
 * Find system-specific application prefixed directory.
 */
export function findSystemAppPrefix (appName, callback) {
  if (!appName) {
    throw new Error('application name required');
  }

  if (process.platform === 'linux') {
    return prepareDir(process.env['XDG_CONFIG_HOME'], appName)
      .or(process.env['HOME'], '.config', appName)
      .or(process.env['XDG_DATA_HOME'], appName)
      .or(process.env['HOME'], '.local', 'share', appName)
      .result(callback);
  } else if (process.platform === 'darwin') {
    return prepareDir(process.env['HOME'], 'Library', 'Logs', appName)
      .or(process.env['HOME'], 'Library', 'Application Support', appName)
      .result(callback);
  } else if (process.platform === 'win32') {
    return prepareDir(process.env['APPDATA'], appName)
      .or(process.env['USERPROFILE'], 'AppData', 'Roaming', appName)
      .result(callback);
  }

  throw new Error('Unsupported platform: ' + process.platform);
}

/**
 * Async version of the same from electron-log.
 */
export function prepareDir (...args) {
  function result (isFile, callback) {
    if (res.argStack.length === 0) {
      return callback(new Error('could not prepare any directories'));
    }

    const nextArgs = res.argStack.shift();
    const p = path.join(...nextArgs);
    const dirname = (isFile ? path.dirname(p) : p);
    mkdirp(dirname, function (err) {
      if (!err) {
        if (!isFile) {
          return callback(null, p);
        }

        return touch(p, function (err) {
          if (!err) {
            return fs.access(p, fs.constants.W_OK, function (err) {
              if (!err) {
                return callback(null, p);
              }

              return result(callback);
            });
          }

          return result(callback);
        });
      }

      return result(callback);
    });
  }

  let res = {
    or: prepareDirNested,
    argStack: [args],
    result: function (callback) {
      return result(false, callback);
    },
    fileResult: function (callback) {
      return result(true, callback);
    }
  };

  function prepareDirNested (...argsNested) {
    res.argStack.push(argsNested);
    return res;
  }

  return res;
}

export function prepareFile (path, callback) {
  return prepareDir(path).fileResult(callback);
}
