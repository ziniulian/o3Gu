// 自选股查询

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.HTML.Util.Url",
	"LZR.Base.Math"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var ajxP = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utMath = LZR.getSingleton(LZR.Base.Math);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);
var dat = {
	ds: {},
	da: [],
	ids: "",
	mgr: false,		// 是否可跳转到管理页面

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

				dat.show(dat.ds[dat.da[0]]);
				for (i = 1; i < dat.da.length; i ++) {
					o = document.createElement("tr");
					o.innerHTML = "<td class='tline' /><td class='tline' /><td class='tline' /><td class='tline' /><td class='tline' />";
					tbs.appendChild(o);
					dat.show(dat.ds[dat.da[i]]);
				}
				b = true;
			}
		}
		dat.busy = false;
		if (b) {
			dat.getP();
		}
	},

	getP: function () {
		if (!dat.busy) {
			dat.busy = true;
			mark.className = "mark";
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
		mark.className = "Lc_nosee";
		dat.busy = false;
	},

	show: function (o) {
// console.log(o);
		var r = document.createElement("tr");
		var d = document.createElement("td");
		var s = o.alia || o.nam;

		// 名称
		d.innerHTML = (dat.mgr && o.typ) ? "<a target='_blank' href='opOne.html?id=" + o.id + "'>" + s + "</a>" : s;
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
			o.pDom.className = "";
			if (o.op.min) {
				s = utMath.format(o.op.min + 0.02, 2) + "<br />";
				if (p <= o.op.min) {
					o.pDom.className = "clrErr";
				}
			} else if (o.op.p0) {
				s = utMath.format(o.op.p0, 2) + "<br />";
				if (p <= o.op.p0) {
					o.pDom.className = "clrGo";
				}
			} else {
				s = "--<br />";
			}
			s += utMath.format(p, 2);
			s += "<br />";
			if (o.op.max) {
				s += utMath.format(o.op.max, 2);
				if (p > o.op.max) {
					o.pDom.className = "clrGo";
				}
			} else {
				s += "--";
			}
			o.pDom.innerHTML = s;

			// 量
			o.vDom.className = "";
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
				o.gainDom.innerHTML = Math.floor((p - o.op.p) * o.op.v * 100);
			} else {
				o.gainDom.innerHTML = "--";
			}
		} else {
			o.pDom.innerHTML = utMath.format(io[1], 2);
			o.vDom.innerHTML = utMath.format(io[5] / 1000, 1);
		}
		o.fDom.innerHTML = io[3] + "%";
	}

};

function init() {
	var r = utUrl.getRequest();
	if (r.mgr) {
		dat.mgr = true;		// 可跳转到管理页面
		lzr_tools.utDomTool.setProByNam("dmad_io_gu", "href", "indexMgr.html");
	} else {
		lzr_tools.getDomains("io_gu");
	}

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
				mark.className = "Lc_nosee";
				dat.busy = false;
			}
			dat.getP();
		}
	};

	dat.get();

	lzr_tools.trace();
}
