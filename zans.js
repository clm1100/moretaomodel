/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Zan 点赞
  var ZanSchema = new db.Schema({
    user: { type: db.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    commodity: { type: db.ObjectId, ref: 'Commodity' },
    activity: { type: db.ObjectId, ref: 'Activity' },
    topic: { type: db.ObjectId, ref: 'Topic' },
    comment: { type: db.ObjectId, ref: 'Comment' }
  }, db.schemaOptions);

  ZanSchema.index({ user: 1 });
  ZanSchema.index({ commodity: 1 }, { sparse: true });
  ZanSchema.index({ topic: 1 }, { sparse: true });
  ZanSchema.index({ comment: 1 }, { sparse: true });

  global.Zan = db.mongoose.model('Zan', ZanSchema);
};
