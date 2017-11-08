// 股票模块

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Base.Time",
	"LZR.Node.Db.Mongo",
	"LZR.Node.Db.NodeAjax"
]);

// 需要用到的根据函数
var tools = {
	utTim: LZR.getSingleton(LZR.Base.Time),

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
			onam: [],
			other: []
		};
		var i;

		for (i = 0; i < 5; i ++) {
			a[i].shift();
		}
		for (i = 0; i < o.tim.length; i ++) {
			o.p.push(null);
		}
		for (i = 5; i < a.length; i ++) {
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
				if (a[0][n] > s.balance.tim[0]) {
					break;
				}
			}
			if (n) {
				var len = s.balance.tim.length;
				var i, j, k;
				for (j = n; j > 0; j --) {
					s.balance.p.unshift(null);
				}
				for (i = 0; i < a.length; i ++) {
					switch (i) {
						case 0:
							for (j = n; j > 0; j --) {
								s.balance.tim.unshift(a[i][j]);
							}
							break;
						case 1:
							for (j = n; j > 0; j --) {
								s.balance.inc.unshift(a[i][j]);
							}
							break;
						case 2:
							for (j = n; j > 0; j --) {
								s.balance.ass.unshift(a[i][j]);
							}
							break;
						case 3:
							for (j = n; j > 0; j --) {
								s.balance.pf.unshift(a[i][j]);
							}
							break;
						case 4:
							for (j = n; j > 0; j --) {
								s.balance.up.unshift(a[i][j]);
							}
							break;
						default:
							k = i - 5;
							if (s.balance.onam[k] === a[i][0]) {
								for (j = n; j > 0; j --) {
									s.balance.other[k].unshift(a[i][j]);
								}
							} else {
								for (j = n; j > 0; j --) {
									s.balance.other[k].unshift(null);
								}
								k = s.balance.onam.length;
								s.balance.onam[k] = a[i][0];
								for (j = 0; j < len; j ++) {
									a[i].push(null);
								}
								s.balance.other[k] = a[i];
							}
							break;
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
	}

};

// Ajax
var ajax = new LZR.Node.Db.NodeAjax ({
	enc: "gb2312",
	hd_sqls: {
		fundamentals: "http://q.stock.sohu.com/cn/<0>/cwzb.shtml",	// 搜狐基本面消息
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
		if (req.qpobj.fundTyp == 2) {
			res.json(a);
		} else if (req.qpobj.fundTyp == 3) {
			res.json(a ? tools.crtFundObj(a) : a);
		} else {
			req.qpobj.count --;
			if (a) {
				var o = tools.parseFundNam(r);
				var s = req.qpobj.stock[o.id];
				var f = {
					nam: o.nam
				};
				req.qpobj.fund[o.id] = f;
				tools.upFund(f, s, a);
				if (f.balance || f.nam !== s.nam) {
					// 将整理后的数据覆盖到数据库中
					mdb.qry("set", req, res, next, [ {id: s.id}, {$set: f} ]);
				}
			}
			if (req.qpobj.count === 0) {
				res.json(req.qpobj.fund);
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
		res.json(o.split(";"));
	} else {
		res.send("[]");
	}
});

// 数据库
var mdb = new LZR.Node.Db.Mongo ({
	conf: process.env.OPENSHIFT_MONGODB_DB_URL ? process.env.OPENSHIFT_MONGODB_DB_URL : "mongodb://localhost:27017/test",
	autoErr: true,
	hd_sqls: {
		jsonpOptionalStockDat: {
			db: "test",
			tnam: "optionalStock",
			funs: {
				find: [{}, {"_id": 0}],
				toArray: []
			}
		},

		get: {
			db: "test",
			tnam: "gu",
			funs: {
				find: ["<0>", "<1>"],
				toArray: []
			}
		},

		add: {
			db: "test",
			tnam: "gu",
			funs: {
				insertMany: ["<0>"]
			}
		},

		set: {
			db: "test",
			tnam: "gu",
			funs: {
				updateOne: ["<0>", "<1>"]
			}
		}
	}
});

mdb.evt.jsonpOptionalStockDat.add(function (r, req, res, next) {
	var s = "var lzr_optionalStock_dat=";
	s += mdb.utJson.toJson(r);
	s += ";";
	res.send(s);
});

mdb.evt.get.add(function (r, req, res, next) {
	switch (req.qpobj.fundTyp) {
		case "srvAddIds":
			var a = tools.idFilter(req.qpobj.oids, r);
			if (a.length) {
				mdb.qry("add", req, res, next, [a]);
			}
			res.json(a);
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
				res.send("null");
			}
			break;
		default:
			res.json(r);
			break;
	}
});

// 创建路由
var r = new LZR.Node.Router ({
	path: curPath,
	hd_web: "web"
});
// var r = srv.ro;

// 获取JSONP格式的自选股数据信息
r.get("/jsonpOptionalStockDat", function (req, res, next) {
	mdb.qry("jsonpOptionalStockDat", req, res, next);
});

// 时间测试
r.get("/srvTestTim/:tim", function (req, res, next) {
	var s = req.params.tim;
	var r = "时间：" + s;
	var t = Date.parse(s);
	r += "<br>解析的时间戳：" + t;
	var d = new Date(t);
	r += "<br>时间显示：" + d;
	r += "<br>时间的时间戳：" + d.valueOf();
	var dd = d.getTimezoneOffset() * 60000;
	r += "<br>动态时差：" + dd;
	var ud = Date.parse("1970-1-1");
	r += "<br>UTC时差：" + ud;
	var tp = 3600 * 1000 * 24;
	var dt = Math.floor((t - dd) / tp);
	r += "<br>动态日时间戳：" + dt;
	var ut = Math.floor((t - ud) / tp);
	r += "<br>UTC日时间戳：" + ut;

	res.send(r);
});

// 页面解析测试
r.get("/srvTestFund/:id/:typ?", function (req, res, next) {
	req.qpobj = {
		fundTyp: req.params.typ	// 0: 精简的HTML; 2: 解析后的数组; 3: 转换为数据库对象的样子;
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



/********************************************/

// 获取基本面信息
r.get("/srvGetFund/tim/:ids?", function (req, res, next) {
	req.qpobj = {
		fundTyp: "srvGetFund"
	};
});

// 更新基本面的参考价
r.get("/srvFlushFundPrice", function (req, res, next) {
	// 获取所有现有的代码
	// 获取所有代码对应的价格
	// 循环更新数据库中的参考价
	res.send("null");
});


/********************************************/

// 百度K线
r.get("/getBaiduK/:typ/:cod", function (req, res, next) {
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
			res.send("[]");
			return;
	}
	ajax.qry("baiduK", req, res, next, [req.params.cod, t]);
});

// // 初始化模板
// r.initTmp();

module.exports = r;
