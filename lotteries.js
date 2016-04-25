/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Prize 奖品
  var PrizeSchema = new db.Schema({
    title: { type: String, trim:true },
    num:{ type: String, trim:true },
    type:{ type:Number, default:1 },
    order:{ type:Number, default:1 }
  }, db.schemaOptions);

  global.Prize = db.mongoose.model('Prize', PrizeSchema);

  global.PrizeTypes = {
    online: { t:'线上邮寄', v:0 },
    url: { t:'线上直接发送', v:1 },
    offline: { t:'线下领取', v:2 }
  };

  global.PrizeOrders = {
    one:{ t:'一等奖', v:1 },
    second:{ t:'二等奖', v:2 },
    third:{ t:'三等奖', v:3 },
    fourth:{ t:'四等奖', v:4 },
    fifth:{ t:'五等奖', v:5 },
    sixth:{ t:'六等奖', v:6 },
    seventh:{ t:'七等奖', v:7 },
    eighth:{ t:'八等奖', v:8 },
    ninth:{ t:'九等奖', v:9 },
    tenth:{ t:'十等奖', v:10 }
  };

  // Model Lottery 抽奖活动
  /**
    strategy 为抽奖策略字段, 具体规定如下

    normal: [Number], 表示在正常状态下 (绝大部分人) 奖池中的奖项
      如果有多个就在多个奖项中随机发放
      如果可能不中奖就加入 -1
      注意: normal 中的奖项没有数量限制, 不会进行数量判断

    ranges: [{range: String, nums: [Number], weight: Number}],
      'range' 为时间区间, 表示为 '12:00-14:50' 格式, 代表特殊时间区间的奖池, 时间段不可重复
      'nums' [Number] 为可中的选项, 如果有多个会随机发放, 如果奖项发放完成则会返回 normal
      'per' 百分比, 浮点数, 表示进入奖池的用户的占比, 例如 0.1 表示有 10% 的用户会进入奖池

    例如:
    {
      normal: [-1, 5],
      ranges: [
        { range: '9:00-11:59', nums: [3, 4], pre: 1 },
        { range: '12:00-15:00', nums: [1, 2, 3, 4], pre: 0.1 },
        { range: '19:00-21:00', nums: [1, 2, 3, 4], pre: 0.1 },
      ]
    }
  */
  var LotterySchema = new db.Schema({
    t:{ type: String, trim:true },
    prefix: Number,
    num: Number,
    start: Date,
    end: Date,
    close:Date,
    strategy: {},
    prizes:[PrizeSchema]
  }, db.schemaOptions);

  global.Lottery = db.mongoose.model('Lottery', LotterySchema);

  // Model LotteryPoolRecord 奖池记录
  var LotteryPoolRecordSchema = new db.Schema({
    lottery: { type: db.ObjectId, ref: 'Lottery' },
    order: Number,
    day: Number,
    used: { type:Boolean, default: false }
  }, db.schemaOptions);

  LotteryPoolRecordSchema.index({ lottery: 1 });

  global.LotteryPoolRecord = db.mongoose.model('LotteryPoolRecord', LotteryPoolRecordSchema);

  // Model LotteryReceiveRecord 领奖记录
  var LotteryReceiveRecordSchema = new db.Schema({
    user: { type:db.ObjectId, ref:'User' },
    lottery: { type:db.ObjectId, ref:'Lottery' },
    prize: { type:db.ObjectId, ref:'Prize' },
    code: { type:String, trim:true },
    name:{ type:String, trim:true },
    phone:{ type:String, trim:true },
    address:{ type:String, trim:true },
    idnum:{ type:String, trim:true },
    zipcode:{ type:String, trim:true },
    type:{ type:Number, default:0 },
    idcard: {
      a: { type: String, trim:true },
      b: { type: String, trim:true }
    },
    at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  LotteryReceiveRecordSchema.index({ lottery: 1 });
  LotteryReceiveRecordSchema.index({ prize: 1 });

  global.LotteryReceiveRecord = db.mongoose.model('LotteryReceiveRecord', LotteryReceiveRecordSchema);

  global.LotteryReceiveTypes = {
    receive: { t:'已领取', v:0 },
    unregistered: { t:'未登记', v:1 },
    failure: { t:'发送失败', v:2 },
    overdue: { t:'已过期', v:3 }
  };
};
