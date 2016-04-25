/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  global.commentDeepItems = 'user sub_comments.user sub_comments.main zans.user';

  // Model SubComment 回复
  var SubCommentSchema = new db.Schema({
    c: { type: String, trim:true },
    at: { type: Date, default: Date.now },
    main: { type: db.ObjectId, ref: 'User' },
    user: { type: db.ObjectId, ref: 'User' }
  }, db.schemaOptions);

  SubCommentSchema.pre('save', function(next) {
    this.c = db.escape.santize(this.c);
    next();
  });

  global.SubComment = db.mongoose.model('SubComment', SubCommentSchema);

  // Model Comment 评论
  var CommentSchema = new db.Schema({
    c: { type: String, trim:true },
    user: { type: db.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    zans: [{ type: db.ObjectId, ref: 'Zan' }],
    zans_count: { type:Number, default: 0 },
    sub_comments: [SubCommentSchema],
    commodity: { type: db.ObjectId, ref: 'Commodity' },
    topic: { type: db.ObjectId, ref: 'Topic' },
    activity: { type: db.ObjectId, ref: 'Activity' }
  }, db.schemaOptions);

  CommentSchema.index({ user:1 });
  CommentSchema.index({ commodity:1 }, { sparse:true });
  CommentSchema.index({ topic:1 }, { sparse:true });

  CommentSchema.pre('save', function(next) {
    var comment = this;
    comment.c = db.escape.santize(comment.c);

    Zan.find({ comment:comment.id }).select('_id').sort('-at').exec(function(err, zans) {
      var ids = [];
      _.each(zans, function(z) {
        ids.push(z._id);
      });

      comment.zans_count = zans.length;
      comment.zans = ids;
      next();
    });
  });

  CommentSchema.pre('remove', function(next) {
    var comment = this;
    Zan.remove({ comment: comment.id }, function(err) { if(err) console.error(err); });
    next();
  });

  CommentSchema.plugin(db.deep, { populate: {
    user: { select:deepSelectsForUser },
    'sub_comments.main': { select:deepSelectsForUser },
    'sub_comments.user': { select:deepSelectsForUser },
    'zan_list.user': { select:deepSelectsForUser }
  } });

  global.Comment = db.mongoose.model('Comment', CommentSchema);
};
