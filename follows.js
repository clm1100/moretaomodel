/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Follow 关注
  var FollowSchema = new db.Schema({
    user_id: { type: db.ObjectId, ref: 'User' },
    fan_id: { type: db.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  FollowSchema.index({ user_id: 1 });
  FollowSchema.index({ fan_id: 1 });

  global.Follow = db.mongoose.model('Follow', FollowSchema);
};
