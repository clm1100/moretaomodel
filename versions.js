/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Version 用户建议
  var VersionSchema = new db.Schema({
    appid: { type: String, trim:true },
    v: { type: String, trim:true },
    d: { type: String, trim:true },
    url: { type: String, trim:true },
    force: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  VersionSchema.index({ user: 1 });

  global.Version = db.mongoose.model('Version', VersionSchema);
};
