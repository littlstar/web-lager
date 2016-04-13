/**
 * Web services logging with s3 integration.
 *
 * @author Wells Johnston <wells@littlstar.com>
 */

'use strict'

const S3Transport = require('./lib/transports/s3');
const levels = ['access', 'log', 'info', 'warn', 'debug', 'error'];
const morgan = require('morgan');
const through = require('through');

class Lager {

  /**
   * @constructor
   * @param {Object} opts
   * @param {Array} [opts.transports]
   */

  constructor(opts) {

    opts.transports = opts.transports || [];
    this.transports = opts.transports.map(opts => {
      if (opts.type == 's3') {
        opts.aws = opts.aws || opts.aws || null;
        return new S3Transport(opts);
      }
    });

    /* expose access logging read stream */
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

  accessLogger() {
    return morgan('combined', { stream: this.accessStream });
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

    /* format log entry */
    entries = entries.map(e => typeof e == 'object' ? JSON.stringify(e, null, 2) : e);
    let entry = [new Date().toJSON(), level.toUpperCase(), entries.join(' ')].join('\t');

    /* send log to stdout or stderr */
    if (['access', 'log', 'info', 'debug'].indexOf(level) > -1) {
      console.log(entry);
    } else if (['warn', 'error'].indexOf(level) > -1) {
      console.error(entry);
    }

    /* log to each of the transports */
    this.transports.forEach(t => t.log(level, entry));
  }

}

module.exports = Lager;
