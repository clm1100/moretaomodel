/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');
var thunk = require('thunks')();

module.exports = function(utils, db) {
  global.activityDeepItems = 'comments.user comments.sub_comments.user';
  global.tinySelectsForActivity = '_id t d cover is_publish show_ext is_out url force_top at start end position tags zans_count comments_count';

  // Model Activity 活动
  var ActivitySchema = new db.Schema({
    cover: String,
    t:{ type:String, trim:true, index:{ unique: true } },
    d:{ type:String, trim:true },
    c:{ type:String, trim:true },
    url:{ type:String, trim:true },
    show_ext:{ type:Boolean, default:true },
    is_out:{ type:Boolean, default:false },
    is_publish:{ type:Boolean, default:false, es_indexed:true },
    position:{ type:Number, default:0 },
    limit:{ type:Number, required:true, default:-1 },
    count:{ type:Number, default:0 },
    comments_count:{ type:Number, default:0 },
    start:{ type:Date },
    end:{ type:Date },
    at:{ type:Date, default:Date.now },
    zans_count:{ type:Number, default:0 }
  }, db.schemaOptions);

  ActivitySchema.index({ t:1 });
  ActivitySchema.index({ is_publish:1 });
  ActivitySchema.index({ force_top:-1, position:-1, start:-1, end:-1 });

  ActivitySchema.virtual('cover_original').get(function() {
    return this.cover ? cloudUrl + 'activity/cover/' + this.cover : null;
  });

  ActivitySchema.virtual('cover_content').get(function() {
    return this.cover ? cloudUrl + 'activity/cover/' + this.cover + '!content' : null;
  });

  ActivitySchema.virtual('cover_thumb').get(function() {
    return this.cover ? cloudUrl + 'activity/cover/' + this.cover + '!thumb' : null;
  });

  ActivitySchema.virtual('cover_waterfall').get(function() {
    return this.cover ? cloudUrl + 'activity/cover/' + this.cover + '!thumb' : null;
  });

  ActivitySchema.pre('save', function(next) {
    var activity = this;

    thunk.all([
      thunk(function(cb) {
        Zan.find({ activity:activity.id }).select('_id').sort('-at').exec(function(err, list) { cb(err, list);});
      }),
      thunk(function(cb) {
        Comment.find({ activity:activity.id }).select('_id').sort('-at').exec(function(err, list) { cb(err, list);});
      })
    ])(function(error, results) {
      activity.comments_count = results[1].length;
      activity.zans_count = results[0].length;
      activity.comments = _.map(results[1], function(c) { return c._id; });

      next();
    });
  });

  ActivitySchema.pre('remove', function(next) {
    var activity = this;

    Comment.find({ activity: activity.id }, function(err, items) {
      _.each(items, function(item, i) {
        item.remove();
      });

      next();
    });
  });

  ActivitySchema.plugin(db.mongoosastic, _.extend({ index:'activities', hydrate:true }, db.mongoosasticOptions));

  ActivitySchema.plugin(db.deep, { populate: {
    'comments.user': { select:deepSelectsForUser },
    'comments.sub_comments.user': { select:deepSelectsForUser }
  } });

  global.Activity = db.mongoose.model('Activity', ActivitySchema);
};
