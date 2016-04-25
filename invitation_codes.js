/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Invitation Code 邀请码
  var InvitationCodeSchema = new db.Schema({
    code: Number,
    used: Boolean
  }, db.schemaOptions);

  global.InvitationCode = db.mongoose.model('Invitation_Code', InvitationCodeSchema);
};
