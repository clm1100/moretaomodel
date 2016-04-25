/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Message 私信
  var MessageSchema = new db.Schema({
    from: { type: db.ObjectId, ref: 'User' },
    to: { type: db.ObjectId, ref: 'User' },
    is_read: { type: Boolean, default: false },
    msg: { type: String, trim:true },
    photo: { type: String, trim:true },
    at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  MessageSchema.index({ from: 1 });
  MessageSchema.index({ to: 1 });

  MessageSchema.virtual('original').get(function() {
    return this.photo ? cloudUrl + 'message/' + (this.from.nickname ? this.from.id : this.from) + '/' + this.photo + '!cover' : null;
  });

  MessageSchema.virtual('thumb').get(function() {
    return this.photo ? cloudUrl + 'message/' + (this.from.nickname ? this.from.id : this.from) + '/' + this.photo + '!thumb' : null;
  });

  global.Message = db.mongoose.model('Message', MessageSchema);
};
