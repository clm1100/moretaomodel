/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  /* 通知类型 */
  global.NoticeTypes = {
    commodity_zan: 'commodity-zan',
    commodity_comment: 'commodity-comment',
    commodity_comment_reply: 'commodity-comment-reply',
    commodity_comment_at: 'commodity-comment-at',
    topic_comment: 'topic-comment',
    topic_comment_reply: 'topic-comment-reply',
    topic_comment_at: 'topic-comment-at',
    activity_comment: 'activity-comment',
    activity_comment_reply: 'activity-comment-reply',
    activity_comment_at: 'activity-comment-at',
    follow: 'follow',
    unfollow: 'unfollow'
  };

  // Model Notice 通知
  var NoticeSchema = new db.Schema({
    user: { type: db.ObjectId, ref: 'User' },
    partner: { type: db.ObjectId, ref: 'User' },
    is_read: { type: Boolean, default: false },
    at: { type: Date, default: Date.now },
    type: { type: String, trim:true },
    data: db.Schema.Types.Mixed
  }, db.schemaOptions);

  NoticeSchema.index({ user: 1 });
  NoticeSchema.index({ is_read: 1 });
  NoticeSchema.index({ type: 1 });

  global.Notice = db.mongoose.model('Notice', NoticeSchema);
};
