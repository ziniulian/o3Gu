// 盘量分析

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.HTML.Util.Url"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);
var dat = {
	busy: false,
	id: null,
	short: false,
	o: 0,
	c: 0,
	p: 0,
	v: 0,
	min: 0,
	max: 0,
	sz: 0,
	sh: 0,
	ps: {},

	flush: function () {
		if (!dat.busy) {
			dat.busy = true;
			mark.className = "mark";

			var url = "srvGetSinaK/000000,399001," + dat.id;
			ajx.get(url, true);
		}
	},

	hdflush: function (txt) {
		var d = utJson.toObj(txt);
		if (d.ok) {
			d = d.dat;
			var o = d[dat.id].split(",");
			if (o[1] === "0.000") {
				tbs.innerHTML = "<tr><td>" + o[2].replace(/\d{1}$/, "") + "</td></tr>";
				tbb.innerHTML = "<tr><td>" + o[11].replace(/\d{1}$/, "") + "</td><td>" + o[10].replace(/\d{2}$/, "") + "</td></tr><tr><td>" + o[21].replace(/\d{1}$/, "") + "</td><td>" + o[20].replace(/\d{2}$/, "") + "</td></tr>";
			} else {
				if (!dat.o) {
					dat.init(o);
				}
				dat.hd(o);
				dat.hd2(d["000000"].split(","), "sh");
				dat.hd2(d["399001"].split(","), "sz");
			}
		}
		mark.className = "Lc_nosee";
		dat.busy = false;
	},

	// 次要数据
	hd2: function (o, pr) {
		var p = o[3] - 0;
		var c = o[2] - 0;
		document.getElementById(pr + "p").innerHTML = dat.strP(dat.getP(p));
		document.getElementById(pr + "a").innerHTML = dat.strP(dat.getP(p - dat[pr]));
		document.getElementById(pr + "s").innerHTML = dat.strP(Math.round((p - c) / c * 10000));
		document.getElementById(pr + "t").innerHTML = Math.floor(o[9] / 100000000);
		dat[pr] = p;
	},

	getP: function (p) {
		return (Math.round(p * 100));
	},

	getV: function (v) {
		return (Math.floor(v / 100));
	},

	strP: function (p) {
		var r = "";
		if (p < 0) {
			p = -p;
			r = "-";
		}
		var m = p % 100;
		var d;
		if (m < 10) {
			d = ".0";
		} else {
			d = "."
		}
		return r + dat.getV(p) + d + m;
	},

	// 初始化
	init: function (o) {
		dat.o = dat.getP(o[1]);
		dat.c = dat.getP(o[2]);
		if (dat.o < dat.c) {
			dat.max = dat.c;
			dat.min = dat.o;
		} else {
			dat.max = dat.o;
			dat.min = dat.c;
		}
	},

	// 获取元素
	get: function (p) {
		if (dat.ps[p]) {
			return dat.ps[p];
		} else {
			var o = {
				v: 0,
				dom: document.createElement("tr"),
				vd:	document.createElement("td"),	// 当前量容器
				ad: document.createElement("td"),	// 增减量容器
				cd: document.createElement("td")	// 实际量容器
			}
			var d = document.createElement("td");
			if (p === dat.c) {
				d.innerHTML += "C_ ";
			}
			if (p === dat.o) {
				d.innerHTML += "O_ ";
			}
			d.innerHTML += dat.strP(p);
			o.dom.appendChild(d);
			o.dom.appendChild(o.vd);
			o.dom.appendChild(o.ad);
			o.dom.appendChild(o.cd);
			dat.ps[p] = o;
			return o;
		}
	},

	// 设置元素
	set: function (p, v, b) {
		var o = dat.get(p);
		var d = v - o.v;
		if (v) {
			o.vd.innerHTML = v * b;
		} else {
			o.vd.innerHTML = "";
		}
		if (d) {
			o.ad.innerHTML = d * b;
		} else {
			o.ad.innerHTML = "";
		}
		o.v = v;
	},

	// 主要数据
	hd: function (o) {
		// 数据收集
		var p = dat.getP(o[3]);
		var v = dat.getV(o[8]);
		var b = [dat.getP(o[11]), dat.getV(o[10]), dat.getP(o[13]), dat.getV(o[12]), dat.getP(o[15]), dat.getV(o[14]), dat.getP(o[17]), dat.getV(o[16]), dat.getP(o[19]), dat.getV(o[18])];
		var s = [dat.getP(o[21]), -dat.getV(o[20]), dat.getP(o[23]), -dat.getV(o[22]), dat.getP(o[25]), -dat.getV(o[24]), dat.getP(o[27]), -dat.getV(o[26]), dat.getP(o[29]), -dat.getV(o[28])];
		var i, j = 0, m = 0, n = 0;
		for (i = 8; i >= 0; i -= 2) {
			if (!m && s[i]) {
				m = s[i];
			}
			if (!n && b[i]) {
				n = b[i];
			}
			if (m && n) {
				break;
			}
		}
		if (!m && !n) {
			return;
		} else if (!m || !n) {
			m = n;
		}

		// 数据整理
		var a = new Array((m - n + 1) * 2);
		for (i = m; i >= n; i --) {
			a[j] = i;
			j ++;
			a[j] = 0;
			j ++;
		}
		for (i = 0; i < 10; i += 2) {
			if (b[i]) {
				a[(2 * (m - b[i]) + 1)] = b[i + 1];
			}
			if (s[i]) {
				a[(2 * (m - s[i]) + 1)] = s[i + 1];
			}
		}
// console.log(a);

		// 最值
		if (dat.min > n) {
			dat.min = n;
		}
		if (dat.max < m) {
			dat.max = m;
		}

		// 设值
		for (i = 0; i < j; i += 2) {
			dat.set(a[i], a[i + 1], (a[i] > b[0] ? -1 : 1));
		}

		// 当前值
		if (dat.p) {
			dat.ps[dat.p].cd.innerHTML = "";
		}
		dat.ps[p].cd.innerHTML = (v - dat.v);
		dat.v = v;
		dat.p = p;

		// 清空增减量
		for (i = dat.max; i > m; i --) {
			p = dat.get(i);
			p.ad.innerHTML = "";
		}
		for (i = dat.min; i < n; i ++) {
			p = dat.get(i);
			p.ad.innerHTML = "";
		}

		// 页面刷新
		tbs.innerHTML = "";
		tbb.innerHTML = "";
		if (dat.p === s[0]) {
			p = s[0] - 1;
		} else {
			p = b[0];
		}
		for (i = dat.max; i > p; i --) {
			tbs.appendChild(dat.ps[i].dom);
		}
		for (i = p; i >= dat.min; i --) {
			tbb.appendChild(dat.ps[i].dom);
		}
		dvv.innerHTML = dat.v;
	}
}

function init() {
	var r = utUrl.getRequest();
	dat.id = r.id;
	if (r.s) {
		dat.short = true;
	}

	document.onkeyup = function (e) {
		if (e.keyCode === 32) {
			// 空格
			dat.flush();
		} else if (e.keyCode === 13) {
			// 回车键
			if (dat.busy) {
				ajx.abort();
				mark.className = "Lc_nosee";
				dat.busy = false;
			}
			dat.flush();
		}
	};

	ajx.evt.rsp.add(dat.hdflush);

	// document.onclick = dat.flush;

	dat.flush();
}
