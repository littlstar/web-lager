'use strict'

const aws = require('aws-sdk');
const levels = ['log', 'info', 'warn', 'debug', 'error'];

/**
 * A logging transport to an s3 folder
 */

class S3Transport {

  /**
   * @constructor
   * @param {Object} opts
   * @param {String} opts.bucket
   * @param {String} opts.prefix
   * @param {Integer} opts.threshold
   * @param {Array} opts.levels
   */

  constructor(opts) {
    this.bucket = opts.bucket;
    this.prefix = opts.prefix;
    this.threshold = opts.threshold;
    this.levels = opts.levels || levels;
    this.s3 = new aws.S3();
    this.memory = [];
  }

  /**
   * Tells whether a log level is enabled.
   * @param {String} level
   * @return {Boolean} Whether the level is enabled for this transport.
   */

  isEnabled(level) {
    return this.levels.indexOf(level) >= 0;
  }

  /**
   * Puts a log in memory.
   * @param {String} level The level to log
   * @param {String} entry The log entry
   */

  log(level, entry) {
    if (this.isEnabled(level)) {
      this.memory.push(entry);
      if (this.memory.length >= this.threshold) {
        this.flush();
      }
    }
  }

  /**
   * Flushes logs in memory to S3.
   */

  flush() {
    let fileName = new Date().toJSON();
    let opts = {
      Bucket: this.bucket,
      Key: this.prefix + fileName,
      Body: this.memory.join('\n')
    };
    this.memory = [];
    this.s3.putObject(opts, (err, data) => {});
  }

}

module.exports = S3Transport;
