/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');
var sizeOf = require('image-size');
var request = require('request');

module.exports = function(utils, db) {
  // Model Photo 图片
  global.PhotoSchema = new db.Schema({
    position:Number,
    ratio:Number,
    f:{ type:String, trim:true }
  }, db.schemaOptions);

  PhotoSchema.virtual('original').get(function() {
    return this.f ? cloudUrl + 'photo/f/' + this.f + '!cover' : null;
  });

  PhotoSchema.virtual('content').get(function() {
    return this.f ? cloudUrl + 'photo/f/' + this.f + '!content' : null;
  });

  PhotoSchema.virtual('thumb').get(function() {
    return this.f ? cloudUrl + 'photo/f/' + this.f + '!thumb' : null;
  });

  PhotoSchema.pre('save', function(next) {
    var p = this;
    if(p.f && p.f.length > 0 && !p.ratio) {
      var url = p.f ? cloudUrl + 'photo/f/' + p.f + '!waterfall' : null;
      request.get({ url:url, encoding:null }, function(err, res, body) {
        if(!err && body) { var d = sizeOf(body); if(d) { p.ratio = d.width / d.height; } }
        next();
      });
    } else next();
  });

  global.Photo = db.mongoose.model('Photo', PhotoSchema);
};
