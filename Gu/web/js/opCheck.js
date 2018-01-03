// 自选股查询

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.Base.Math"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var ajxP = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utMath = LZR.getSingleton(LZR.Base.Math);
var dat = {
	ds: {},
	da: [],
	ids: "",

	get: function () {
		if (!dat.busy) {
			dat.busy = true;
			var url = "srvGetOp/";
			ajx.get(url, true);
		}
	},

	hdget: function (txt, sta) {
		var b = false;
		var i, d, o, s;
		if (sta === 200) {
			d = utJson.toObj(txt);
			if (d.ok) {
				dat.da = d.msg;
				s = "";
				for (i = 0; i < d.dat.length; i ++) {
					o = d.dat[i];
					dat.ds[o.id] = o;
					if (i) {
						s += ",";
					}
					s += o.id;
				}
				dat.ids = s;
				for (i = 0; i < dat.da.length; i ++) {
					dat.show(dat.ds[dat.da[i]]);
				}
				b = true;
			}
		}
		dat.busy = false;
		if (b) {
// console.log(dat.ids);
// console.log(dat.ds);
// console.log(dat.da);
			dat.getP();
		}
	},

	getP: function () {
		if (!dat.busy) {
			dat.busy = true;
			var url = "srvGetSinaK/" + dat.ids + "/1";
			ajxP.get(url, true);
		}
	},

	hdgetP: function (txt, sta) {
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				for (var s in d.dat) {
					dat.showP(s, d.dat[s].split(","));
				}
			}
		}
		dat.busy = false;
	},

	show: function (o) {
// console.log(o);
		var r = document.createElement("tr");
		var d = document.createElement("td");
		var s;

		// 名称
		if (o.alia) {
			d.innerHTML = o.typ ? "<a href='opOne.html?id=" + o.id + "'>" + o.alia + "</a>" : o.alia;
		} else {
			d.innerHTML = o.typ ? "<a href='opOne.html?id=" + o.id + "'>" + o.nam + "</a>" : o.nam;
		}
		r.appendChild(d);

		// 盈利
		d = document.createElement("td");
		o.gainDom = d;
		r.appendChild(d);

		// 价
		d = document.createElement("td");
		o.pDom = d;
		r.appendChild(d);

		// 量
		d = document.createElement("td");
		o.vDom = d;
		r.appendChild(d);

		// 幅度
		d = document.createElement("td");
		o.fDom = d;
		r.appendChild(d);

		tbs.appendChild(r);
	},

	showP: function (id, io) {
		var o = dat.ds[id];
		var p, v, s;
		if (o.op) {
			p = io[1]-0;
			v = io[4]-0;

			// 价
			if (o.op.min) {
				s = o.op.min + "<br />";
				if (p <= o.op.min) {
					o.pDom.className = "clrErr";
				}
			} else if (o.op.p0) {
				s = o.op.p0 + "<br />";
				if (p <= o.op.p0) {
					o.pDom.className = "clrGo";
				}
			} else {
				s = "--<br />";
			}
			s += utMath.formatFloat(p, 2);
			s += "<br />";
			if (o.op.max) {
				s += o.op.max;
				if (p > o.op.max) {
					o.pDom.className = "clrGo";
				}
			} else {
				s += "--";
			}
			o.pDom.innerHTML = s;

			// 量
			if (o.op.vmin) {
				s = o.op.vmin + "<br />";
				if (v < o.op.vmin) {
					o.vDom.className = "clrGo";
				}
			} else {
				s = "--<br />";
			}
			s += io[4];
			s += "<br />";
			if (o.op.vmax) {
				s += o.op.vmax;
				if (v > o.op.vmax) {
					o.vDom.className = "clrErr";
				}
			} else {
				s += "--";
			}
			o.vDom.innerHTML = s;

			// 盈利
			if (o.op.v) {
				o.gainDom.innerHTML = utMath.formatFloat((p - o.op.p) * o.op.v * 100, 2);
			} else {
				o.gainDom.innerHTML = "--";
			}
		} else {
			o.pDom.innerHTML = utMath.formatFloat(io[1], 2);
			o.vDom.innerHTML = utMath.formatFloat(io[5] / 1000, 1);
		}
		o.fDom.innerHTML = io[3] + "%";
	}

};

function init() {
	ajx.evt.rsp.add(dat.hdget);
	ajxP.evt.rsp.add(dat.hdgetP);

	document.onkeyup = function (e) {
		if (e.keyCode === 32) {
			// 空格
			dat.getP();
		} else if (e.keyCode === 13) {
			// 回车键
			if (dat.busy) {
				ajxP.abort();
				dat.busy = false;
			}
			dat.getP();
		}
	};

	dat.get();
}
