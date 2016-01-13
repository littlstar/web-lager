/**
 * Web services logging with s3 integration.
 *
 * @author Wells Johnston <wells@littlstar.com>
 */

'use strict'

const morgan = require('morgan');
const through = require('through');
const S3Transport = require('./lib/S3Transport');
const levels = ['access', 'log', 'info', 'warn', 'debug', 'error'];

class Lager {

  /**
   * @constructor
   * @param {Object} opts
   * @param {Array} [opts.levels]
   * @param {Array} [opts.transports]
   */

  constructor(opts) {
    this.levels = opts.levels || levels;
    opts.transports = opts.transports || [];

    if (opts.transports != null) {
      this.transports = opts.transports.map(opts => {
        if (opts.type == 's3') {
          return new S3Transport(opts);
        }
      });
    }

    var self = this;
    this.accessStream = through(function(line) {
      if (line != null && line[0] != null) {
        this.push(line.trim());
        self.access(line.trim());
      }
    });
  }

  /**
   * Enables access logging middleware for Express.
   */

  accessLogMiddleware() {
    return morgan('combined', { stream: this.accessStream });
  }

  /**
   * Enables a log level.
   * @param {String} level The logging level to enable.
   */

  enable(level) {
    if (!this.isEnabled(level)) {
      this.levels.push(level);
    }
  }

  /**
   * Disables a log level.
   * @param {String} level The logging level to disable.
   */

  disable(level) {
    while (this.isEnabled(level)) {
      this.levels.splice(this.levels.indexOf(level), 1);
    }
  }

  /**
   * @param {String} level
   * @return {Boolean} Whether the level is enabled on this instance.
   */

  isEnabled(level) {
    return this.levels.indexOf(level) >= 0;
  }

  /**
   * @param {...*} args Any number of arguments of any type to be logged
   */

  access() {
    let args = Array.prototype.slice.call(arguments);
    this.transport('access', args);
  }

  /**
   * @param {...*} args Any number of arguments of any type to be logged
   */

  log() {
    let args = Array.prototype.slice.call(arguments);
    this.transport('log', args);
  }

  /**
   * @param {...*} args Any number of arguments of any type to be logged
   */

  info() {
    let args = Array.prototype.slice.call(arguments);
    this.transport('info', args);
  }

  /**
   * @param {...*} args Any number of arguments of any type to be logged
   */

  warn() {
    let args = Array.prototype.slice.call(arguments);
    this.transport('warn', args);
  }

  /**
   * @param {...*} args Any number of arguments of any type to be logged
   */

  debug() {
    let args = Array.prototype.slice.call(arguments);
    this.transport('debug', args);
  }

  /**
   * @param {...*} args Any number of arguments of any type to be logged
   */

  error() {
    let args = Array.prototype.slice.call(arguments);
    this.transport('error', args);
  }

  /**
   * Send the log to different transports.
   * @param {String} level The logging level.
   * @param {Array} entries An array of strings to put in the log.
   */

  transport(level, entries) {
    var timestamp = new Date().toJSON();
    var entry;

    if (!this.isEnabled(level)) {
      return;
    }

    if (level != 'access') {
      entries = entries.map(e => {
        return typeof e == 'object' ? JSON.stringify(e, null, 2) : e;
      });
      entry = [timestamp, level.toUpperCase(), entries.join(' ')].join('\t');
    } else {
      // if it's an access log, it's already formatted
      entry = entries;
    }

    // send log to stdout / stderr
    if (level == 'access' || level == 'log' || level == 'info' || level == 'debug') {
      console.log(entry);
    } else if (level == 'warn' || level == 'error') {
      console.error(entry);
    }

    // log to each of the transports
    this.transports.forEach(t => {
      t.log(level, entry);
    });
  }

}

module.exports = Lager;
