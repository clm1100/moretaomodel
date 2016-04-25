/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model WeChatAccessTokenSchema
  var WeChatAccessTokenSchema = new db.Schema({
    appid:  { type: String, trim:true, required: true },
    access_token: { type: String, trim:true },
    expires_in: Number,
    at: { type: Number, default: parseInt(new Date().getTime() / 1000) },
    create_at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  WeChatAccessTokenSchema.index({ appid: 1 });
  WeChatAccessTokenSchema.index({ access_token: 1 });

  global.WeChatAccessToken = db.mongoose.model('WeChatAccessToken', WeChatAccessTokenSchema);

  // Model WeChatTicketSchema
  var WeChatTicketSchema = new db.Schema({
    appid: { type: String, trim:true, required: true },
    ticket: { type: String, trim:true },
    noncestr: { type: String, trim:true },
    expires_in: Number,
    at: { type: Number, default: parseInt(new Date().getTime() / 1000) },
    create_at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  WeChatTicketSchema.index({ appid: 1 });
  WeChatTicketSchema.index({ ticket: 1 });

  global.WeChatTicket = db.mongoose.model('WeChatTicket', WeChatTicketSchema);
};
