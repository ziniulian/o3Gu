// 股票模块

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Base.Time",
	"LZR.Node.Db.Mongo",
	"LZR.Node.Db.NodeAjax",
	"LZR.Node.Srv.Result"
]);

// 需要用到的根据函数
var tools = {
	utTim: LZR.getSingleton(LZR.Base.Time),
	clsR: LZR.Node.Srv.Result,

	// 基本面 HTML页面修剪，抓取出最重要的 HTML 信息
	pruneFund: function (txt) {
		var s = txt.lastIndexOf("<table class=\"reportA\">");
		var e = txt.lastIndexOf("</table>") + 8;
		if (s === -1 || e === -1) {
			return null;
		} else {
			return txt.substring(s, e);
		}
	},

	// 解析基本面的时间信息
	parseFundTim: function (s) {
		if (s) {
			return tools.utTim.getDayTimestamp(s + " 0:0");
		} else {
			return null;
		}
	},

	// 解析基本面的数字信息
	parseFundVal: function (s) {
		var r = parseFloat(s);
		return isNaN(r) ? null : r;
	},

	// 解析代码和名称
	parseFundNam: function (s) {
		var r = {
			id: null,
			nam: null
		};
		var i = s.indexOf("<title>") + 7;
		var j = s.indexOf("(", i);
		r.nam = s.substring(i, j);
		j ++;
		i = s.indexOf(")", j);
		r.id = s.substring(j, i);
		return r;
	},

	// 解析基本面数据
	parseFund: function (txt) {
		var s, i, n;
		var a = txt.replace(/\s/g, "").split("<th");
		var r = [];
		for (i = 0; i < a.length; i ++) {
			// s = a[i].replace(/(^.*(?=>.*<\/th>)>)|(<td>)|(<span.*<\/span><\/td>)|(同比变化<\/td>)|((<\/td>)?<\/tr>.*$)/g, "");
			s = a[i].replace(/(^.*(?=>.*<\/th>)>)|(<td>)|((<\/td>)?<\/tr>.*$)/g, "").split("</td>");
			// a[i] = s;
			if (s.length === 6) {
				n = s[0].split("</th>");
				if (i === 1) {
					r.push ([
						n[0],
						tools.parseFundTim(n[1]),
						tools.parseFundTim(s[2]),
						tools.parseFundTim(s[3]),
						tools.parseFundTim(s[4]),
						tools.parseFundTim(s[5])
					]);
				} else {
					r.push ([
						n[0],
						tools.parseFundVal(n[1]),
						tools.parseFundVal(s[2]),
						tools.parseFundVal(s[3]),
						tools.parseFundVal(s[4]),
						tools.parseFundVal(s[5])
					]);
				}
			}
		}
		// console.log(a);
		return r;
	},

	// 生成一个全新的基本面对象
	crtFundObj: function (a) {
		var o = {
			p: [],
			tim: a[0],
			inc: a[1],
			ass: a[2],
			pf: a[3],
			up: a[4],
			roe: a[5],
			onam: [],
			other: []
		};
		var i;

		for (i = 0; i < 6; i ++) {
			a[i].shift();
		}
		for (i = 0; i < o.tim.length; i ++) {
			o.p.push(null);
		}
		for (i = 6; i < a.length; i ++) {
			o.onam.push(a[i].shift());
			o.other.push(a[i]);
		}
		return o;
	},

	// 更新基本面信息
	upFund: function (f, s, a) {
		if (s.balance) {
			// 对原基本面对象进行补充
			var n = a[0].length - 1;
			for (; n > 0; n --) {
				if (a[0][n] && (a[0][n] > s.balance.tim[0])) {
					break;
				}
			}
			if (n) {
				var len = s.balance.tim.length;
				var i, j, k;
				for (j = n; j > 0; j --) {
					s.balance.p.unshift(null);
				}
				for (j = n; j > 0; j --) {
					s.balance.tim.unshift(a[0][j]);
				}
				for (j = n; j > 0; j --) {
					s.balance.inc.unshift(a[1][j]);
				}
				for (j = n; j > 0; j --) {
					s.balance.ass.unshift(a[2][j]);
				}
				for (j = n; j > 0; j --) {
					s.balance.pf.unshift(a[3][j]);
				}
				for (j = n; j > 0; j --) {
					s.balance.up.unshift(a[4][j]);
				}
				for (j = n; j > 0; j --) {
					s.balance.roe.unshift(a[5][j]);
				}
				for (i = 6; i < a.length; i ++) {
					k = i - 6;
					if (s.balance.onam[k] === a[i][0]) {
						for (j = n; j > 0; j --) {
							s.balance.other[k].unshift(a[i][j]);
						}
					} else {
						for (j = n; j > 0; j --) {
							s.balance.other[k].unshift(null);
						}
						k = s.balance.onam.length;
						s.balance.onam[k] = a[i].shift();
						for (j = 0; j < len; j ++) {
							a[i].push(null);
						}
						s.balance.other[k] = a[i];
					}
				}
				f.balance = s.balance;
			}
		} else {
			// 新建基本面对象
			f.balance = tools.crtFundObj(a);
		}
	},

	// 过滤欲添加的id
	idFilter: function (s, a) {
		var r = [];
		var i, j, o;
		for (i = 0; i < s.length; i ++) {
			for (j = 0; j < a.length; j ++) {
				if (s[i] === a[j].id) {
					break;
				}
			}
			if (j === a.length) {
				o = {
					id: s[i],
					ec: tools.matchEc(s[i]),
					typ: tools.matchTyp(s[i])
				};
				if (s[i] === "000000") {
					o.tid = "000001";
				}
				r.push (o);
			}
		}
		return r;
	},

	// 判断所属交易所
	matchEc: function (id) {
		var r = "sz";
		if (id.match(/(^6)|(000000)/)) {
			r = "sh";
		}
		return r;
	},

	// 判断类型
	matchTyp: function (id) {
		var r = 1;
		if (id.match(/(399001)|(000000)/)) {
			r = 0;
		}
		return r;
	},

	// 计算新浪代码号
	calcSinaId: function (p, id) {
		if (id === "000000") {
			return (p + "sh000001");
		} else {
			return (p + tools.matchEc(id) + id);
		}
	},

	// 通过数据库对象计算新浪代码号
	calcSinaIdByDb: function (p, o) {
		return p + o.ec + (o.tid || o.id);
	}

};

// Ajax
var ajax = new LZR.Node.Db.NodeAjax ({
	enc: "gb2312",
	hd_sqls: {
		fundamentals: "http://q.stock.sohu.com/cn/<0>/cwzb.shtml",	// 搜狐基本面消息
		fundPrice: "http://hq.sinajs.cn/list=<0>",	// 新浪接口 _ 基本面价格
		sinaK: "http://hq.sinajs.cn/list=<0>",	// 新浪接口
		baiduK: "https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?resource_id=8188&from_mid=1&eprop=<1>&query=<0>"	// 百度K线(minute, fiveday, month, year, dayK, weekK)
	}
});

ajax.evt.fundamentals.add(function (r, req, res, next) {
	var t = tools.pruneFund(r);
	if (!req.qpobj.fundTyp || req.qpobj.fundTyp === 0) {
		res.send(t);
	} else {
		var a = null;
		if (t) {
			a = tools.parseFund(t);
		}
		if (req.qpobj.fundTyp === 2) {
			res.json(tools.clsR.get( a ));
		} else if (req.qpobj.fundTyp === 3) {
			res.json(tools.clsR.get( a ? tools.crtFundObj(a) : a ));
		} else {
			req.qpobj.count --;
			if (a) {
				var o = tools.parseFundNam(r);
				var s = req.qpobj.stock[o.id];
				var f = {
					nam: o.nam
				};
				req.qpobj.fund[o.id] = f;

				// 重要元素换位
				i = a[5];
				a[5] = a[6];
				a[6] = i;
				tools.upFund(f, s, a);
				if (f.balance || f.nam !== s.nam) {
					// 将整理后的数据覆盖到数据库中
					mdb.qry("set", req, res, next, [ {id: s.id}, {$set: f} ]);
				}
			}
			if (req.qpobj.count === 0) {
				res.json(tools.clsR.get( req.qpobj.fund ));
			}
		}
	}
});

ajax.evt.baiduK.add(function (r, req, res, next) {
	var o = mdb.utJson.toObj(r);
	if (o) {
		o = o.data[0];
	}
	if (o) {
		o = o.disp_data[0].property[0].data.display.tab.p;
		res.json(tools.clsR.get(o.split(";")));
	} else {
		res.json(tools.clsR.get(null, "无数据"));
	}
});

ajax.evt.sinaK.add(function (r, req, res, next) {
	var o = r.replace(/sh000001/, "000000").split(";\n");
	var a = {};
	var e;
	for (var i = 0; i < (o.length - 1); i ++) {
		e = /^.*(\d{6})="(.*)";*$/.exec(o[i]);
		if (e) {
			a[e[1]] = e[2];
		}
	}
	res.json(tools.clsR.get(a));
});

ajax.evt.fundPrice.add(function (r, req, res, next) {
	// 循环更新数据库中的参考价
	var o = r.split(";\n");
	var a = {};
	var e;
	for (var i = 0; i < (o.length - 1); i ++) {
		e = /^.*(\d{6})="[^,]*,([\d\.]*).*";*$/.exec(o[i]);
		if (e) {
			mdb.qry("set", req, res, next, [ {"id": e[1]}, {"$set": {"balance.p.0": (e[2] - 0)}} ]);
			a[e[1]] = e[2];
		}
	}
	res.json(tools.clsR.get(a));
});

// 数据库
var mdb = new LZR.Node.Db.Mongo ({
	conf: process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/test",
	autoErr: true,
	hd_sqls: {
		get: {
			tnam: "gu",
			funs: {
				find: ["<0>", "<1>"],
				toArray: []
			}
		},

		add: {
			tnam: "gu",
			funs: {
				insertMany: ["<0>"]
			}
		},

		set: {
			tnam: "gu",
			funs: {
				updateOne: ["<0>", "<1>"]
			}
		}
	}
});

mdb.evt.get.add(function (r, req, res, next) {
	switch (req.qpobj.fundTyp) {
		case "srvAddIds":
			var a = tools.idFilter(req.qpobj.oids, r);
			if (a.length) {
				mdb.qry("add", req, res, next, [a]);
				res.json(tools.clsR.get(a));
			} else {
				res.json(tools.clsR.get(null, "无需导入"));
			}
			break;
		case "srvFlushFund":
			if (r.length) {
				req.qpobj.count = r.length;
				req.qpobj.stock = {};
				req.qpobj.fund = {};
				for (var i = 0; i < r.length; i ++) {
					// 循环获取最新的基本面信息
					req.qpobj.stock[r[i].id] = r[i];
					ajax.qry("fundamentals", req, res, next, [r[i].id]);
				}
			} else {
				res.json(tools.clsR.get(null, "代码尚未导入"));
			}
			break;
		case "srvFlushFundPrice":
			if (r.length) {
				// 获取所有代码对应的价格
				var d = "";
				for (var i = 0; i < r.length; i ++) {
					d += tools.calcSinaIdByDb(",s_", r[i]);
				}
				d = d.substr(1);
				ajax.qry("fundPrice", req, res, next, [d]);
			} else {
				res.json(tools.clsR.get(null, "没有可操作的对象"));
			}
			break;
		default:
			res.json(tools.clsR.get(r));
			break;
	}
});

// 创建路由
var r = new LZR.Node.Router ({
	path: curPath,
	hd_web: "web"
});

// 新浪接口
r.get("/srvGetSinaK/:ids/:short?", function (req, res, next) {
	var a = req.params.ids.split(",");
	var short = req.params.short ? ",s_" : ",";
	var d = "";
	for (var i = 0; i < a.length; i ++) {
		d += tools.calcSinaId(short, a[i]);
	}
	d = d.substr(1);

	ajax.qry("sinaK", req, res, next, [d]);
});

// 页面解析测试
r.get("/srvTestFund/:id/:typ?", function (req, res, next) {
	req.qpobj = {
		fundTyp: (req.params.typ ? req.params.typ - 0 : 0)	// 0: 精简的HTML; 2: 解析后的数组; 3: 转换为数据库对象的样子;
	};
	ajax.qry("fundamentals", req, res, next, [req.params.id]);
});

// 批量导入代码
r.get("/srvAddIds/:ids", function (req, res, next) {
	var a = req.params.ids.split(",");
	req.qpobj = {
		oids: a,
		fundTyp: "srvAddIds"
	};
	// 数据库不进行锁处理
	mdb.qry("get", req, res, next, [
		{"id": {"$in": a}}, {"_id": 0, "id": 1}
	]);
});

// 更新基本面信息
r.get("/srvFlushFund/:ids?", function (req, res, next) {
	req.qpobj = {
		fundTyp: "srvFlushFund"
	};
	if (req.params.ids) {
		mdb.qry("get", req, res, next, [
			{"id": {"$in": req.params.ids.split(",")}, "typ": 1},
			{"_id": 0, "id": 1, "nam": 1, "balance": 1}
		]);
	} else {
		mdb.qry("get", req, res, next, [
			{"typ": 1}, {"_id": 0, "id": 1, "nam": 1, "balance": 1}
		]);
	}
});

// 更新基本面的参考价 (只更新最新参考价为空的)
r.get("/srvFlushFundPrice/:ids?", function (req, res, next) {
	req.qpobj = {
		fundTyp: "srvFlushFundPrice"
	};
	if (req.params.ids) {
		mdb.qry("get", req, res, next, [
			{"typ": 1, "balance.p.0":{"$in":[null], "$exists":true}, "id": {"$in": req.params.ids.split(",")}},
			{"_id": 0, "id": 1, "ec": 1, "tid": 1}
		]);
	} else {
		mdb.qry("get", req, res, next, [
			{"typ": 1, "balance.p.0":{"$in":[null], "$exists":true}},
			{"_id": 0, "id": 1, "ec": 1, "tid": 1}
		]);
	}
});

// 百度K线
r.get("/srvGetBaiduK/:typ/:cod", function (req, res, next) {
	// 解析typ
	var t;
	switch (req.params.typ) {
		case "D":
			t = "minute";
			break;
		case "5":
			t = "fiveday";
			break;
		case "M":
			t = "month";
			break;
		case "Y":
			t = "year";
			break;
		case "K":
			t = "dayK";
			break;
		case "W":
			t = "weekK";
			break;
		default:
			res.json(tools.clsR.get(null, "类型错误"));
			return;
	}
	ajax.qry("baiduK", req, res, next, [req.params.cod, t]);
});

// 时间测试
r.get("/srvTestTim/:t/:v?", function (req, res, next) {
	if (req.params.v) {
		res.json(tools.clsR.get(tools.utTim.parseDayTimestamp(req.params.v)));
	} else {
		res.json(tools.clsR.get(tools.utTim.getDayTimestamp(req.params.t)));
	}
});

// 数据筛选
r.get("/srvGetByTim/:y/:q", function (req, res, next) {
	req.qpobj = {
		fundTyp: "srvGetByTim"
	};
	var tim;
	switch (req.params.q) {
		case "1":
			tim = tools.parseFundTim (req.params.y + "-3-31");
			break;
		case "2":
			tim = tools.parseFundTim (req.params.y + "-6-30");
			break;
		case "3":
			tim = tools.parseFundTim (req.params.y + "-9-30");
			break;
		case "4":
			tim = tools.parseFundTim (req.params.y + "-12-31");
			break;
		default:
			res.json(tools.clsR.get(null, "无效的季度"));
			return;
	}

	mdb.qry("get", req, res, next, [
		{"balance.tim": tim},
		{"_id":0, "id":1, "nam":1, "balance.p":1, "balance.tim":1, "balance.inc":1, "balance.ass":1, "balance.pf":1, "balance.up":1, "balance.roe":1}
	]);
});

// 获取所有代码
r.get("/srvGetAllIds", function (req, res, next) {
	req.qpobj = {
		fundTyp: "srvGetAllIds"
	};
	mdb.qry("get", req, res, next, [
		{"typ": 1}, {"_id": 0, "id": 1}
	]);
});

// 获取信息
r.get("/srvGet/:ids?", function (req, res, next) {
	req.qpobj = {
		fundTyp: "srvGet"
	};
	if (req.params.ids) {
		mdb.qry("get", req, res, next, [
			{"id": {"$in": req.params.ids.split(",")}}, {"_id": 0}
		]);
	} else {
		mdb.qry("get", req, res, next, [
			{"typ": 1}, {"_id": 0}
		]);
	}
});

// // 初始化模板
// r.initTmp();

module.exports = r;
