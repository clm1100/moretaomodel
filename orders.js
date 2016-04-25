/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  /* 快递供应商 */
  global.WBVendors = {
    ems:{ t:'EMS', v:0 },
    sf:{ t:'顺丰速运', v:1 },
    sto:{ t:'申通快递', v:2 },
    ty:{ t:'圆通快递', v:3 },
    zto:{ t:'中通快递', v:4 },
    yunda:{ t:'韵达快递', v:5 },
    best:{ t:'百世汇通', v:6 },
    jd:{ t:'京东物流', v:7 },
    fedex:{ t:'联邦快递', v:8 },
    dhl:{ t:'DHL', v:9 },
    zjs:{ t:'宅急送', v:10 },
    tk:{ t:'天天快递', v:11 },
    db:{ t:'德邦物流', v:12 },
    cainiao:{ t:'菜鸟网络', v:13 },
    qf:{ t:'全峰快递', v:14 },
    rr:{ t:'人人快递', v:15 },
    pingyou:{ t:'邮政平邮', v:16 }
  };

  /* 支付渠道 */
  global.PaymentChannels = {
    alipay:{ t:'支付宝', v:0 },
    wx:{ t:'微信支付', v:1 },
    upacp:{ t:'银联支付', v:2 },
    bfb:{ t:'百度钱包', v:3 },
    apple_pay:{ t:'Apple Pay', v:4 }
  };

  /* 订单状态 */
  global.OrderStatuses = {
    waiting_payment:{ t:'待付款', v:0 },
    waiting_confirm:{ t:'待接单', v:1 },
    waiting_deliver:{ t:'待发货', v:2 },
    waiting_receive:{ t:'待收货', v:3 },
    waiting_comment:{ t:'待评价', v:4 },
    finish:{ t:'已完成', v:5 },
    canceled:{ t:'已取消', v:6 }
  };

  /* 退款状态 */
  global.RefundStatuses = {
    refunding:{ t:'退款中', v:0 },
    canceled:{ t:'已取消', v:1 },
    failed:{ t:'退款失败', v:2 },
    refunded:{ t:'已退款', v:3 }
  };

  // Model Order 订单
  var OrderSchema = new db.Schema({
    user:{ type:db.ObjectId, ref:'User', require:true },
    status:{ type:Number, require:true },
    create_at:{ type:Date, default:Date.now },
    updated_at:{ type:Date, default:Date.now },
    // 订单项
    items:[{
      commodity:{ type:db.ObjectId, ref:'Commodity', require:true },
      p:{ type:Number, require:true },
      count:{ type:Number, require:true, default:1 }
    }],
    // 支付记录
    payment:{
      channel:{ type:String, trim:true, require:true },
      amount:{ type:Number, require:true },
      charge:{},
      create_at:{ type:Date, default:Date.now },
      updated_at:{ type:Date, default:Date.now },
      // 折扣项
      discounts:[{
        type:{ type:Number, require:true },
        amount:{ type:Number, require:true }
      }]
    },
    // 退款记录
    refund:{
      reason:{ type:String, trim:true, require:true },
      status:{ type:Number, require:true },
      create_at:{ type:Date, default:Date.now },
      updated_at:{ type:Date, default:Date.now }
    },
    // 运单项
    wb:{
      no:{ type:String, trim:true, require:true },
      address:{ type:String, trim:true, require:true },
      to:{ type:String, trim:true, require:true },
      phone:{ type:String, trim:true, require:true },
      vendor:{ type:Number, require:true },
      state:{ type:String, trim:true, require:true },
      updated_at:{ type:Date, default:Date.now }
    }
  }, db.schemaOptions);

  OrderSchema.index({ user:1 }, { unique:true });
  OrderSchema.index({ at:-1 });
  OrderSchema.index({ status:1 });

  OrderSchema.virtual('p').get(function() {
    var result = 0;
    if(this.items) _.each(this.items, function(it) { result += parseInt(it.p); });

    return result;
  });

  OrderSchema.methods.makePaymentAmount = function() {
    var order = this, price = 0;
    if(order.payment && order.items) {
      if(order.items) price = _.sumBy(order.items, 'p');
      if(price > 0 && order.payment.discounts) price -= _.sumBy(order.items, 'amount');
      order.payment.amount = price;
    }
  };

  global.Order = db.mongoose.model('Order', OrderSchema);
};
