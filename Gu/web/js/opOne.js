// 自选股详情

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.Base.Math",
	"LZR.HTML.Util.Url"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var ajxSav = new LZR.HTML.Base.Ajax ();
var ajxP = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utMath = LZR.getSingleton(LZR.Base.Math);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);
var dat = {
	id: null,
	memoTim: 0,
	dp: 0,
	dv: 0,
	p: 0,
	v: 0,
	min: 0,
	max: 0,

	get: function () {
		if (dat.id && !dat.busy) {
			dat.busy = true;
			var url = "srvGetOp/" + dat.id;
			ajx.get(url, true);
		}
	},

	hdget: function (txt, sta) {
		var b = false;
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				d = d.dat[0];
				dat.min = d.op.min;
				dat.max = d.op.max;
				dat.p = d.op.p;
				dat.v = d.op.v;
				dat.dp = dat.p;
				dat.dv = dat.v;
				namDom.innerHTML = d.nam + " ( " + d.id + " ) ";
				p0Dom.value = d.op.p0;
				vmaxDom.value = d.op.vmax;
				vminDom.value = d.op.vmin;
				if (d.alia) {
					aliaDom.value = d.alia;
				}
				dat.reset();
				b = true;
			}
		}
		dat.busy = false;
		if (b) {
			dat.getP();
		}
	},

	sav: function () {
		if (dat.id && !dat.busy) {
			dat.busy = true;
			var url = "srvSetOp/" + dat.id + "/" + dat.dp + "/" + maxDom.value + "/" + minDom.value + "/" + dat.dv + "/" + vmaxDom.value + "/" + vminDom.value + "/" + p0Dom.value + "/" + aliaDom.value;
			ajxSav.get(url, true);
		}
	},

	hdsav: function (txt, sta) {
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				dat.p = d.dat.op.p;
				dat.v = d.dat.op.v;
				dat.min = d.dat.op.min;
				dat.max = d.dat.op.max;
				dat.memo ("保存成功");
			} else {
				dat.memo ("保存失败");
			}
		}
		dat.busy = false;
	},

	// 信息提示
	memo: function (msg, tim) {
		if (!tim) {
			tim = 2000;
		}
		dat.memoHid();
		memoDom.innerHTML = msg;
		dat.memoTim = setTimeout(function () {
			memoDom.innerHTML = "";
			dat.memoTim = 0;
		}, tim);
	},

	memoHid: function () {
		if (dat.memoTim) {
			clearTimeout(dat.memoTim);
			memoDom.innerHTML = "";
			dat.memoTim = 0;
		}
	},

	buy: function () {
		var p = dpDom.value - 0;
		var v = dvDom.value - 0;
		var t;
		dpDom.value = "";
		dvDom.value = "";
		if (p && v) {
			t = dat.dp * dat.dv + p * v * 1.01;
			dat.dv += v;
			dat.dp = utMath.formatFloat(t / dat.dv + 0.01, 2);
			pDom.innerHTML = dat.dp;
			vDom.innerHTML = dat.dv;
			basDom.value = dat.dp;
		}
	},

	sell: function () {
		var p = dpDom.value - 0;
		var v = dvDom.value - 0;
		var t;
		dpDom.value = "";
		dvDom.value = "";
		if (v) {
			if (v >= dat.dv) {
				dat.dv = 0;
				dat.dp = 0;
				dat.set(0);
				basDom.value = "";
			} else if (p && p < dat.dp) {
				t = (dat.dp - p) * v;
				dat.dv = utMath.formatFloat(dat.dv - v, 2);
				dat.dp = utMath.formatFloat(t / dat.dv + dat.dp + 0.01, 2);
				basDom.value = dat.dp;
			} else {
				dat.dv = utMath.formatFloat(dat.dv - v, 2);
			}
			pDom.innerHTML = dat.dp;
			vDom.innerHTML = dat.dv;
		}
	},

	set: function (v) {
		if (!v) {
			sminDom.innerHTML = "止损 ： ";
			smaxDom.innerHTML = "止盈 ： ";
			maxDom.value = 0;
			minDom.value = 0;
			return;
		}

		var p = basDom.value - 0;
		var min, max, x = 0;
		if (p) {
			switch (v) {
				case 1:
					max = 2;
					min = -2;
					break;
				case 2:
					max = 3;
					min = -1;
					break;
				case 3:
					max = 4;
					min = 0;
					break;
				case 4:
					max = 7;
					min = 1;
					break;
				case 5:
					max = 11;
					min = 5;
					break;
				case 6:
					max = 13;
					min = 7;
					break;
				case 7:
					max = 19;
					min = 10;
					break;
				case 8:
					max = 25;
					min = 15;
					break;
				case 9:
					max = 34;
					min = 20;
					break;
				case 10:
					max = 58;
					min = 24;
					x = -10;
					break;
				case 11:
					max = 77;
					min = 50;
					break;
				case 12:
					max = 111;
					min = 62;
					x = -15;
					break;
				case 13:
					max = 122;
					min = 100;
					break;
				case 14:
					max = 0;
					min = 112;
					x = -10;
					break;
			}

			// 止损
			if (x) {
				sminDom.innerHTML = "(相对" + x + "%)止损 ： ";
			} else {
				sminDom.innerHTML = "(" + min + "%)止损 ： ";
			}
			minDom.value = utMath.formatFloat(p * (min / 100 + 1), 2);

			// 止盈
			if (max) {
				smaxDom.innerHTML = "(" + max + "%)止盈 ： ";
				maxDom.value = utMath.formatFloat(p * (max / 100 + 1), 2);
			} else {
				smaxDom.innerHTML = "(不封顶)止盈 ： ";
				maxDom.value = 0;
			}
		}
	},

	reset: function () {
		pDom.innerHTML = dat.p;
		vDom.innerHTML = dat.v;
		minDom.value = dat.min;
		maxDom.value = dat.max;
		sminDom.innerHTML = "止损 ： ";
		smaxDom.innerHTML = "止盈 ： ";
		if (dat.p) {
			basDom.value = dat.p;
		} else {
			basDom.value = "";
		}
		dat.getP();
	},

	getP: function () {
		if (dat.id && !dat.busy) {
			dat.busy = true;
			var url = "srvGetSinaK/" + dat.id + "/1";
			ajxP.get(url, true);
		}
	},

	hdgetP: function (txt, sta) {
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				vpDom.innerHTML = d.dat[dat.id].split(",")[1];
			}
		}
		dat.busy = false;
	}

};

function init() {
	var r = utUrl.getRequest();
	dat.id = r.id;
	ajx.evt.rsp.add(dat.hdget);
	ajxP.evt.rsp.add(dat.hdgetP);
	ajxSav.evt.rsp.add(dat.hdsav);
	dat.get();
}
