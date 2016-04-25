/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');
var thunk = require('thunks')();

module.exports = function(utils, db) {
  global.topicDeepItems = 'commodities commodities.user comments.user comments.sub_comments.user';
  global.tinySelectsForTopic = '_id t cover is_out url is_publish show_ext force_top at position tags zans_count comments_count';

  // Model TopicSchema 攻略
  var TopicSchema = new db.Schema({
    t: { type: String, trim:true, required: true, es_indexed: true },
    c: { type: String, trim:true },
    cover: { type: String, trim:true },
    url: { type: String, trim:true },
    show_ext: { type: Boolean, default: true },
    is_out: { type: Boolean, default: false },
    is_publish: { type: Boolean, default: false, es_indexed: true },
    force_top: { type: Boolean, default: false },
    position:{ type: Number, default: 0 },
    at: { type: Date, default: Date.now },
    tags: [{ type: db.ObjectId, ref: 'Tag', es_indexed:true }],
    commodities: [{ type: db.ObjectId, ref: 'Commodity' }],
    zans_count: { type:Number, default: 0 },
    comments_count: { type:Number, default: 0 }
  }, db.schemaOptions);

  TopicSchema.index({ force_top: -1, position: -1, at: -1 });
  TopicSchema.index({ is_publish: 1 });
  TopicSchema.index({ commodities: 1 });
  TopicSchema.index({ tags: 1 });
  TopicSchema.index({ at: -1 });

  TopicSchema.virtual('cover_original').get(function() {
    return this.cover ? cloudUrl + 'topic/cover/' + this.cover + '!cover' : null;
  });

  TopicSchema.virtual('cover_content').get(function() {
    return this.cover ? cloudUrl + 'topic/cover/' + this.cover + '!content' : null;
  });

  TopicSchema.virtual('cover_thumb').get(function() {
    return this.cover ? cloudUrl + 'topic/cover/' + this.cover + '!thumb' : null;
  });

  TopicSchema.pre('save', function(next) {
    var topic = this;

    thunk.all([
      thunk(function(cb) { Zan.find({ topic:topic.id }).select('_id').sort('-at').exec(function(err, list) { cb(err, list);}); }),
      thunk(function(cb) { Comment.find({ topic:topic.id }).select('_id').sort('-at').exec(function(err, list) { cb(err, list);}); })
    ])(function(error, results) {
      topic.zans_count = results[0].length;
      topic.comments_count = results[1].length;
      topic.comments = _.map(results[1], function(c) { return c._id; });

      next();
    });
  });

  TopicSchema.pre('remove', function(next) {
    var topic = this;

    Comment.find({ topic: topic.id }, function(err, items) {
      _.each(items, function(item, i) { item.remove(); });
      Zan.remove({ topic: topic.id }, function(err) { if(err) console.error(err); });

      next();
    });
  });

  TopicSchema.plugin(db.mongoosastic, _.extend({ index:'topics', hydrate:true }, db.mongoosasticOptions));

  TopicSchema.plugin(db.deep, { populate: {
    'comments.user': { select:deepSelectsForUser },
    'comments.sub_comments.user': { select:deepSelectsForUser }
  } });

  global.Topic = db.mongoose.model('Topic', TopicSchema);
};
