'use strict';
var _ = require('lodash');
var thunk = require('thunks')();
var pinyin = require('pinyin');
var request = require('request');
var aws = require('amazon-product-api');
var url = require('wurl');

/* 淘宝相关 */
var taobaoAppKey = '23244085';
var taobaoAppSecret = '32ae7eee8b39e54aa23b6ece3caadf0e';

/* 亚马逊相关 */
var awsOptopns = {
  cn: {
    key: 'AKIAI2AGJILE72NAXX5A',
    secret: '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',
    tag: 'moretao-23',
    domain: 'webservices.amazon.cn'
  },
  us: {
    key: 'AKIAI2AGJILE72NAXX5A',
    secret: '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',
    tag: 'moretao-20',
    domain: 'webservices.amazon.com'
  },
  jp: {
    key: 'AKIAI2AGJILE72NAXX5A',
    secret: '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',
    tag: 'moretao-22',
    domain: 'webservices.amazon.co.jp'
  }
};

var awsClients = {
  cn: aws.createClient({
    awsId: awsOptopns.cn.key,
    awsSecret: awsOptopns.cn.secret,
    awsTag: awsOptopns.cn.tag
  }),
  us: aws.createClient({
    awsId: awsOptopns.us.key,
    awsSecret: awsOptopns.us.secret,
    awsTag: awsOptopns.us.tag
  }),
  jp: aws.createClient({
    awsId: awsOptopns.jp.key,
    awsSecret: awsOptopns.jp.secret,
    awsTag: awsOptopns.jp.tag
  })
};

module.exports = function(utils, db) {
  global.commodityDeepItems = 'topics user comments.user comments.sub_comments.user';
  global.deepSelectsForCommodity = 't d p price currency user tags photos zans_count comments_count';

  // Model Commodity 商品
  var CommoditySchema = new db.Schema({
    user: { type:db.ObjectId, ref:'User' },
    t: { type:String, trim:true, es_indexed: true },
    d: { type:String, trim:true, es_indexed: true },
    sid: { type:String, trim:true },
    url: { type:String, trim:true },
    op: Number,
    p: { type:Number, es_indexed:true },
    show_ext: { type:Boolean, default: true },
    copy_right: { type:Boolean, default:false, es_indexed:true },
    is_selected: { type:Boolean, default:false, es_indexed:true },
    is_publish: { type:Boolean, default:true, es_indexed:true },
    is_abroad: Boolean,
    is_light: { type:Boolean, default:false },
    force_top: { type:Boolean, default:false },
    position:{ type:Number, default: 0 },
    currency: { type:String, trim:true },
    region: { type:String, trim:true },
    at: { type:Date, default:Date.now, es_indexed:true },
    photos: { type:[PhotoSchema], es_indexed:false },
    categories: [{ type:db.ObjectId, ref:'Category', es_indexed:true }],
    zans_count: { type:Number, default:0, es_indexed:true },
    comments_count: { type:Number, default: 0 },
    collect_count: { type:Number, default: 0 },
    topics: [{ type:db.ObjectId, ref:'Topic' }],
    tags: [{ type:db.ObjectId, ref:'Tag', es_indexed:true }],
    customTags: { type:[CustomTagSchema], es_indexed:false },
    keywords: { type:String, trim:true, es_indexed:true }
  }, db.schemaOptions);

  CommoditySchema.index({ force_top:-1, position:-1, at:-1 });
  CommoditySchema.index({ user:1 });
  CommoditySchema.index({ is_publish:1 });
  CommoditySchema.index({ categories:1 });
  CommoditySchema.index({ topics:1 });
  CommoditySchema.index({ tags:1 });
  CommoditySchema.index({ at:-1 });
  CommoditySchema.index({ p:1 });

  CommoditySchema.virtual('price').get(function() {
    if(!this.p || this.p === '' || this.p < 1) return '';
    if(this.currency === 'CNY') return '<span class="fa fa-cny"> ' + formatMoney(this.p) + '</span>';
    if(this.currency === 'USD') return '<span class="fa fa-dollar"> ' + formatMoney(this.p) + '</span>';
    if(this.currency === 'HKD') return '<span class="fa fa-dollar"> ' + formatMoney(this.p) + '</span>';
    if(this.currency === 'EUR') return '<span class="fa fa-euro"> ' + formatMoney(this.p) + '</span>';
    if(this.currency === 'KRW') return '<span class="fa fa-krw"> ' + formatMoney(this.p) + '</span>';
    if(this.currency === 'JPY') return '<span>' + formatMoney(this.p) + ' 円</span>';

    return this.p && this.p > 0 ? '<span class="fa fa-cny"> ' + formatMoney(this.p) + '</span>' : 0;
  });

  CommoditySchema.virtual('source').get(function() {
    if(!this.url) return 'shopping';

    if(this.url.indexOf('taobao.com') > -1 || this.url.indexOf('mashort.cn') > -1) return 'taobao';
    else if(this.url.indexOf('jd.com') > -1) return 'jd';
    else if(this.url.indexOf('tmall.com') > -1) return 'tmall';
    else if(this.url.indexOf('thinkgeek.com') > -1) return 'thinkgeek';
    else if(this.url.indexOf('marvel.com') > -1) return 'marvel';
    else if(this.url.indexOf('hottopic.com') > -1) return 'hottopic';
    else if(this.url.indexOf('amazon') > -1) return 'amazon';
    else if(this.url.indexOf('terminatorstore.com') > -1) return 'terminator';
    else if(this.url.indexOf('rakuten.co.jp') > -1) return 'rakuten';
    else if(this.url.indexOf('goodsmile.ecq.sc') > -1) return 'goodsmile';
    else if(this.url.indexOf('dol.cn') > -1 || this.url.indexOf('disneystore.com') > -1) return 'disney';
    else if(this.url.indexOf('gsactivity.diditaxi.com.cn') > -1) return 'luckmoney';
    else return 'shopping';
  });

  CommoditySchema.methods.findSame = function(current, cb) {
    var where = {};
    return this.model('Commodity').find(where).where({ _id:{ $ne:this.id } }).where('tags').in(this.tags).limit(4).exec(cb);
  };

  CommoditySchema.pre('save', function(next) {
    var commodity = this;

    thunk.all([
      thunk(function(cb) {
        Zan.find({ commodity:commodity.id }).select('_id').sort('-at').exec(function(err, list) { cb(err, list);});
      }),
      thunk(function(cb) {
        Comment.find({ commodity:commodity.id }).select('_id').sort('-at').exec(function(err, list) { cb(err, list);});
      }),
      thunk(function(cb) {
        Favorite.count({ commodities:{ $in: [commodity.id] } }).exec(function(err, count) { cb(err, count);});
      }),
      thunk(function(cb) {
        Tag.find({ _id:{ $in:commodity.tags } }).exec(function(err, tags) { cb(err, tags);});
      })
    ])(function(error, results) {
      commodity.zans_count = results[0].length;
      commodity.comments_count = results[1].length;
      commodity.collect_count = results[2];
      commodity.comments = _.map(results[1], function(c) { return c._id; });

      var keywords = [];
      _.each(results[3], function(t) {
        keywords.push(t.t);

        // 全拼
        var quanpin = pinyin(t.t, { heteronym: false, style: pinyin.STYLE_NORMAL });
        // 简拼
        var jianpin = pinyin(t.t, { heteronym: false, style: pinyin.STYLE_FIRST_LETTER });

        if(quanpin && quanpin.length > 1) keywords.push(quanpin.join(''));
        if(jianpin && jianpin.length > 1) keywords.push(jianpin.join(''));

        if(t.synonyms && t.synonyms.length > 0) keywords.push(t.synonyms.join(' '));
        if(t.associations && t.associations.length > 0) keywords.push(t.associations.join(' '));
      });
      _.each(commodity.custom_tags, function(t) { keywords.push(t.d); });
      keywords = _.uniqBy(keywords, true);

      commodity.keywords = keywords.join(' ');

      // 其他属性
      if(!commodity.force_top) commodity.force_top = false;

      next();
    });
  });

  CommoditySchema.pre('remove', function(next) {
    var commodity = this;

    Comment.find({ commodity:commodity.id }, function(err, items) {
      var ids = _.map(function(item) { return item.id; });

      Zan.remove({ comment:{ $in:ids } }, function(err) {
        thunk.all([
          thunk(function(cb) { Comment.remove({ commodity: commodity.id }, function(err) { cb(err, null); }); }),
          thunk(function(cb) { Zan.remove({ commodity: commodity.id }, function(err) { cb(err, null); }); }),
          thunk(function(cb) { Favorite.update({}, { $pull:{ commodities:{ _id: commodity.id } } }).exec(function(err) { cb(err, null); }); }),
          thunk(function(cb) { Tag.find({ _id:{ $in:commodity.tags } }).exec(function(err, tags) { cb(err, tags);}); })
        ])(function(error, results) { next(); });
      });
    });
  });

  CommoditySchema.methods.makePromotionData = function(cb) {
    var commodity = this;

    if(!_.isEmpty(commodity.sid) || _.isEmpty(commodity.url) || commodity.url.length < 5) cb();
    else {
      var id, items, source;

      var link = commodity.url;
      var domain = url('domain', link);

      var options = {
        headers: { 'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4' }
      };

      thunk(function(callback) {
        // 淘宝, 天猫
        if (domain === 'taobao.com' || domain === 'tmall.com') {
          commodity.is_abroad = false;
          commodity.region = 'CN';
          commodity.currency = 'CNY';
          source = 'taobao';

          // 爱淘宝转换链接特殊处理
          if(link.indexOf('redirect.simba.taobao.com') > -1) {
            request.get(_.extend(options, { url:link }), function(err, res, body) {
              var urls = body.match(/'itemId':'.*?',/ig);
              if(urls && urls.length > 0) {
                var json = JSON.parse('{' + urls[0].replace(',', '') + '}');
                if(json.itemId !== null) {
                  id = json.itemId;
                  commodity.sid = json.itemId;
                }
              }
              callback(null, null);
            });
          } else if(link.indexOf('izhongchou.taobao.com') > -1) {
            // 淘宝众筹特殊处理
            commodity.sid = null;
            callback(null, null);
          } else {
            id = url('?id', link);
            if (id !== null) commodity.sid = id;
            callback(null, null);
          }
        } else if(domain === 'mashort.cn') {
          // 微口令
          // 样例 http://m.mashort.cn/98a1a5e0-8bc7-4638-85e6-621b3ebbc6bc?sm=3f5486

          // 获取淘口令的商品 ID
          request.get(_.extend(options, { url:link }), function(err, res, body) {
            var urls = body.match(/http:\/\/item\.taobao\.com\/item\.htm.*?;/ig);
            if(urls && urls.length > 0) {
              var cid = url('?id', urls[0]);
              if (cid !== null) {
                id = cid;
                commodity.sid = cid;
              }
              commodity.is_abroad = false;
              commodity.region = 'CN';
              commodity.currency = 'CNY';
              source = 'taobao';
            }
            callback(null, null);
          });
        } else if(domain === 'jd.com' || domain === 'jd.hk') {
          // 京东

          id = url('?wareId', link);
          if (!id) id = url('filename', link);
          if (id !== null) {
            commodity.sid = id;
            commodity.is_abroad = false;
            commodity.region = 'CN';
            commodity.currency = 'CNY';
            source = 'jd';
          }
          callback(null, null);
        } else if(domain === 'amazon.cn' || domain === 'amazon.com' || domain === 'co.jp') {
          // 亚马逊

          id = url('2', link);
          if(id === 'product' || id === 'dp') id = url('3', link);
          if(id === 'aw') id = url('4', link);
          commodity.sid = id;
          commodity.is_abroad = (domain !== 'amazon.cn');

          if (domain === 'amazon.cn' && id !== null) {
            // 卓越亚马逊
            commodity.region = 'CN';
            commodity.currency = 'CNY';
            source = 'amazon.cn';
          } else if(domain === 'amazon.com' && id !== null) {
            // 美亚
            commodity.region = 'US';
            commodity.currency = 'USD';
            source = 'amazon.com';
          } else if(domain === 'co.jp' && id !== null) {
            // 日亚
            commodity.region = 'JP';
            commodity.currency = 'JPY';
            source = 'amazon.jp';
          }

          callback(null, null);
        } else if (domain === 'thinkgeek.com') {
          // ThinkGeek
          id = url('2', link);
          if (id !== null) {
            commodity.sid = id;
            commodity.is_abroad = true;
            commodity.region = 'US';
            commodity.currency = 'USD';
            source = 'thinkgeek.com';
          }
          callback(null, null);
        } else if(domain === 'disneystore.com') {
          // DisneyStore
          id = url('4', link);
          if (id !== null) {
            commodity.sid = id;
            commodity.is_abroad = true;
            commodity.region = 'US';
            commodity.currency = 'USD';
            source = 'disneystore.com';
          }
          callback(null, null);
        } else if(domain === 'hottopic.com') {
          // HotTopic
          items = url('4', link).split('-');

          id = items[items.length - 1].replace('.jsp', '');
          if (id !== null) {
            commodity.sid = id;
            commodity.is_abroad = true;
            commodity.region = 'US';
            commodity.currency = 'USD';
            source = 'hottopic.com';
          }
          callback(null, null);
        } else if(domain === 'marvel.com') {
          // Marvel
          // shop.marvel.com/marvel-comics-rolling-luggage/mp/17033/1000210/
          items = url('4', link).split('-');
          id = items[items.length - 1].replace('.jsp', '');
          if (id !== null) {
            commodity.sid = id;
            commodity.is_abroad = false;
            commodity.region = 'US';
            commodity.currency = 'USD';
            source = 'marvel.com';
          }
          callback(null, null);
        } else callback(null, null);
      })(function(error, results) {
        if(_.isEmpty(_.trim(commodity.sid))) commodity.sid = null;

        if(id && id.length > 0 && source && source.length > 0) {
          domain = null;
          // 亚马逊
          if(source.indexOf('amazon') > -1) {
            var awsClient;
            // 卓越亚马逊
            if(source.indexOf('amazon.cn') > -1 && source.indexOf('moretao-23') < 0) {
              awsClient = awsClients.cn;
              domain = awsOptopns.cn.domain;
            }
            // 日亚
            if(source.indexOf('amazon.jp') > -1 && source.indexOf('moretao-22') < 0) {
              awsClient = awsClients.jp;
              domain = awsOptopns.jp.domain;
            }
            // 美亚
            if(source.indexOf('amazon.com') > -1 && source.indexOf('moretao-20') < 0) {
              awsClient = awsClients.us;
              domain = awsOptopns.us.domain;
            }

            // 亚马逊统一处理
            if(awsClient) {
              awsClient.itemLookup({
                idType: 'ASIN',
                itemId: id,
                domain: domain,
                truncateReviewsAt: '2000',
                responseGroup: 'ItemAttributes,Offers,Images'
              }).then(function(results) {
                var full = results[0].DetailPageURL[0];
                if(full && full.length > 0) commodity.url = decodeURIComponent(full);
                cb(null, null);
              }).catch(function(err) { cb(err, null); });
            } else cb(null, null);
          } else cb(null, null);

            // TODO 其他
        } else cb(null, null);
      });
    }
  };

  CommoditySchema.plugin(db.mongoosastic, _.extend({ index:'commodities', hydrate:true }, db.mongoosasticOptions));
  CommoditySchema.plugin(db.deep, { populate: {
    user: { select:deepSelectsForUser },
    'comments.user': { select:deepSelectsForUser },
    'comments.sub_comments.user': { select:deepSelectsForUser }
  } });

  global.Commodity = db.mongoose.model('Commodity', CommoditySchema);
};

/* 价格格式化 */
function formatMoney(num) {
  if(!num) return 0;

  num = num.toString().replace(/\$|,/g, '');
  if(isNaN(num)) num = '0';
  var sign = (num === (num = Math.abs(num)).toString());
  num = Math.floor(num * 100 + 0.50000000001);
  var cents = num % 100;
  num = Math.floor(num / 100).toString();
  if(cents < 10) cents = '0' + cents;
  for(var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }
  return (((sign) ? '' : '-') + num + (cents !== '00' ? '.' + cents : ''));
}
