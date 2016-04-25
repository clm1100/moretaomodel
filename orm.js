/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');
var express = require('express');
var request = require('request');
var fs = require('fs');
var escape = require('chn-escape');
var harmonious = fs.readFileSync('routes/harmonious.txt', 'utf-8').split('\n');

escape.init(harmonious);

global.cloudUrl = null;

module.exports = function(utils) {
  /* env */
  var isDevelopment = utils.app.get('env') === 'development';

  if (isDevelopment) {
    global.cloudUrl = 'http://dev.images.moretao.com/';
  } else {
    global.cloudUrl = 'http://dev.images.moretao.com/';
  }

  var mongoose = require('mongoose'), mongoosastic = require('mongoosastic');
  var mongooseOptions = { server: { poolSize: 10 } };
  var mongoosasticOptions;

  if (isDevelopment) {
    mongoose.set('debug', true);
    mongoose.connect('mongodb://localhost/moretao', mongooseOptions);
    mongoosasticOptions = { host:'localhost', port: 9200, hydrate:true, bulk:{ size:500, delay:500 } };
  } else {
    mongoose.set('debug', false);
    mongoose.connect('mongodb://10.51.85.197/moretao', mongooseOptions);
    mongoosasticOptions = { host: '10.51.85.197', port: 9200, hydrate:true, bulk: { size:500, delay:500 } };
  }

  var deep = require('mongoose-deep-populate')(mongoose), Schema = mongoose.Schema, ObjectId = mongoose.Schema.Types.ObjectId;

  var schemaOptions = { versionKey:false, toJSON:{ getters:true, virtuals:true }, toObject:{ getters:true, virtuals:true } };

  var db = {
    escape:escape,
    mongoose:mongoose,
    mongooseOptions:mongooseOptions,
    mongoosastic:mongoosastic,
    mongoosasticOptions:mongoosasticOptions,
    deep:deep,
    Schema:Schema,
    ObjectId:ObjectId,
    schemaOptions:schemaOptions
  };

  /* 定时发布 */
  require('./publishtasks')(utils, db);

  /* 广告 */
  require('./ads')(utils, db);

  /* Tab */
  require('./tabs')(utils, db);

  /* 页面片段 */
  require('./fragments')(utils, db);

  /* 分享计数 */
  require('./share_count')(utils, db);

  // Model Admin 管理员
  require('./admins')(utils, db);

  // Model Photo 图片
  require('./photos')(utils, db);

  // Model Tag & CustomTag 标签和自定义标签
  require('./tags')(utils, db);

  // Model Category 分类
  require('./categories')(utils, db);

  // Model Region 区域
  require('./regions')(utils, db);

  // Model Notice 通知
  require('./notices')(utils, db);

  // Model Complaint 举报
  require('./complaints')(utils, db);

  // Model Invitation Code 邀请码
  require('./invitation_codes')(utils, db);

  // Model Message 私信
  require('./messages')(utils, db);

  /* 用户 */
  require('./users')(utils, db);

  /* 用户爱好 */
  require('./hobbies')(utils, db);

  // Model Address 区域
  require('./addresses')(utils, db);

  // Model Account 账户
  require('./accounts')(utils, db);

  // Model Order 订单
  require('./orders')(utils, db);

  // Model Follow 关注
  require('./follows')(utils, db);


  // Model Zan 点赞
  require('./zans')(utils, db);

  // Model Comment & SubComment 评论和子评论
  require('./comments')(utils, db);

  // Model Commodity 商品
  require('./commodities')(utils, db);

  // Model Favorite 收藏夹
  require('./favorites')(utils, db);

  // Model Topic 攻略
  require('./topics')(utils, db);

  // Model Activity 活动
  require('./activities')(utils, db);

  // Model Lottery, Prize & LotteryReceiveRecord 抽奖, 奖项设置和抽奖记录
  require('./lotteries')(utils, db);

  // Model Postcard & PostcardRecord 明信片和明信片发送历史
  require('./postcards')(utils, db);

  // Model SearchHistory 搜索历史
  require('./search_histories')(utils, db);

  // Model Suggest 用户建议
  require('./suggests')(utils, db);

  // Model ToShoppingRecord 电商跳转记录
  require('./to_shopping_records')(utils, db);

  // Model Version 用户建议
  require('./versions')(utils, db);

  // Model Checkin 用户签到
  require('./checkin')(utils, db);

  // Model WeChatAccessTokenSchema & WeChatTicketSchema
  require('./wechat')(utils, db);
};
