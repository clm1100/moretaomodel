/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  global.TagGroupNames = {
    brand:'brand',
    works:'works',
    ip:'ip',
    sex:'sex',
    age:'age',
    home_tabs:'home_tabs',
    home_ips:'home_ips',
    user_hobbies:'user_hobbies',
    filter_category:'filter_category',
    filter_sort:'filter_sort',
    filter_sex:'filter_sex',
    filter_age:'filter_age'
  };

  // 标签列表
  global.TagList = [
    { v:'d', d: '默认' },
    { v:'o', d: '内部使用' },
    { v:'country', d: '国家和地区' },
    { v:'currency', d:'币种' },
    { v:TagGroupNames.brand, d:'品牌' },
    { v:TagGroupNames.works, d:'作品' },
    { v:TagGroupNames.ip, d:'形象' },
    { v:'class', d:'品类' },
    { v:'scene', d:'场景' },
    { v:'hots', d:'热门' },
    { v:'gift', d:'礼物' },
    { v:'person', d:'个性' },
    { v:'sticker', d:'贴纸' },
    { v:'guarantee', d:'售后/保障' },
    { v:TagGroupNames.user_hobbies, d:'用户爱好' },
    { v:TagGroupNames.sex, d:'适合性别' },
    { v:TagGroupNames.age, d:'适合年龄段' },
    { v:TagGroupNames.home_tabs, d:'首页推荐 Tabs' },
    { v:TagGroupNames.home_ips, d:'首页推荐 IPs' },
    { v:TagGroupNames.filter_age, d:'过滤器年龄段' },
    { v:TagGroupNames.filter_sex, d:'过滤器性别' },
    { v:TagGroupNames.filter_category, d:'过滤器类别' },
    { v:TagGroupNames.filter_sort, d:'过滤器排序' }
  ];

  // Model Tag 标签
  var TagSchema = new db.Schema({
    list: { type:String, trim:true, required:true, default:'d', es_indexed:true },
    t: { type:String, trim:true, es_indexed:true },
    d: { type:String, trim:true },
    synonyms: { type:[String], es_indexed:true },
    associations: { type:[String], es_indexed:true },
    cover: { type:String, trim:true },
    position: { type:Number, required:true, default:0 },
    limit: { type:Number, required:true, default:-1 },
    used: { type:Number, required:true, default:0 },
    count: { type:Number, required:true, default:0 }
  }, db.schemaOptions);

  TagSchema.index({ list:1 });
  TagSchema.index({ t:1 });
  TagSchema.index({ position:1 });

  TagSchema.virtual('cover_original').get(function() {
    return this.cover ? cloudUrl + 'tag/cover/' + this.cover : null;
  });
  TagSchema.virtual('cover_thumb').get(function() {
    return this.cover ? cloudUrl + 'tag/cover/' + this.cover + '!thumb' : null;
  });
  TagSchema.virtual('label').get(function() {
    var t = _.find(TagList, { v:this.list });
    return t ? t.d : '';
  });

  TagSchema.plugin(db.mongoosastic, _.extend({ index:'tags', hydrate:true }, db.mongoosasticOptions));
  global.Tag = db.mongoose.model('Tag', TagSchema);

  global.CustomTagSchema = new db.Schema({
    d:{ type:String, trim:true },
    x:Number,
    y:Number,
    o:{ type:String, trim:true, default:'l' }
  }, db.schemaOptions);
  global.CustomTag = db.mongoose.model('CustomTag', CustomTagSchema);
};
