'use strict'

const aws = require('aws-sdk');
const schedule = require('node-schedule');
const levels = ['access', 'log', 'info', 'warn', 'debug', 'error'];

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
    this.threshold = opts.threshold || Infinity;
    this.levels = opts.levels || levels;
    this.memory = [];

    if (opts.aws != null) {
      this.s3 = new aws.S3({
        accessKeyId: opts.aws.access_key_id,
        secretAccessKey: opts.aws.secret_access_key
      });
    } else {
      this.s3 = new aws.S3();
    }

    if (opts.frequency != null) {
      schedule.scheduleJob(opts.frequency, () => {
        this.flush();
      });
    }
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
    if (this.memory.length == 0) return;
    let fileName = new Date().toJSON();
    let opts = {
      Bucket: this.bucket,
      Key: this.prefix + fileName,
      Body: this.memory.join('\n')
    };
    this.memory = [];
    this.s3.putObject(opts, (err, data) => {}).catch(console.error);
  }

}

module.exports = S3Transport;
