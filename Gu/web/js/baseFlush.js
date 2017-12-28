// 更新基本面数据

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.HTML.Util.Url"
]);

var ajxId = new LZR.HTML.Base.Ajax ();
var ajx = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);
var dat = {
	busy: false,
	ids: [],
	fs: [],		// 基本面任务组
	fi: 0,		// 基本面任务标记
	ps: [],		// 参考价任务组
	pi: 0,		// 参考价任务标记

	allId: function () {
		if (!dat.busy) {
			dat.busy = true;
			var url = "srvGetAllIds/";
			ajxId.get(url, true);
		}
	},

	hdallId: function (txt) {
		var d = utJson.toObj(txt);
		if (d.ok) {
			d = d.dat;
			for (var i = 0; i < d.length; i ++) {
				dat.ids.push(d[i].id);
			}
		}
		dat.busy = false;
		dat.run();
	},

	// 任务开始
	run: function () {
		// 整理基本面任务组
		if (dat.fi > -1) {
			dat.crtS("F", 3);
		}

		// 整理参考价任务组
		if (dat.pi > -1) {
			dat.crtS("P", 5);
		}

		// 执行任务
		dat.do();
	},

	// 创建任务组
	crtS: function (typ, num) {
		var i = 0, j, r, o;
		while (i < dat.ids.length) {
			r = "";
			for (j = 0; j < num && i < dat.ids.length; j ++) {
				if (j) {
					r += ",";
				}
				r += dat.ids[i];
				i ++;
			}
			o = {
				id: r,
				typ: typ,
				dom: document.createElement("tr"),
				sdom: document.createElement("td")
			};
			r = document.createElement("td");
			r.innerHTML = typ;
			o.dom.appendChild(r);
			r = document.createElement("td");
			r.innerHTML = o.id;
			o.dom.appendChild(r);
			o.sdom.innerHTML = "准备";
			o.dom.appendChild(o.sdom);
			tbs.appendChild(o.dom);

			switch (typ) {
				case "F":
					dat.fs.push(o);
					break;
				case "P":
					dat.ps.push(o);
					break;
			}
		}
	},

	// 执行任务
	do: function () {
		var o = null, url;
		if (dat.fi > -1 && dat.fi < dat.fs.length) {
			o = dat.fs[dat.fi];
			url = "srvFlushFund/" + o.id + "/1";
		} else if (dat.pi > -1 && dat.pi < dat.ps.length) {
			o = dat.ps[dat.pi];
			url = "srvFlushFundPrice/" + o.id;
		}
		if (o && !dat.busy) {
			dat.busy = o;
			o.sdom.innerHTML = "执行中 ...";
			ajx.get(url, true);
		}
	},

	// 执行回调
	hddo: function (txt, st) {
		if (st === 200) {
			dat.busy.sdom.innerHTML = "";
			switch (dat.busy.typ) {
				case "F":
					dat.fi ++;
					break;
				case "P":
					dat.pi ++;
					break;
			}
			dat.busy = false;
			dat.do();
		}
	},

	stop: function () {
		if (dat.busy) {
			var o = dat.busy.sdom;
			if (o) {
				ajx.abort();
				o.innerHTML = "准备";
				dat.busy = false;
			}
		} else {
			dat.do();
		}
	}

}

function init() {
	var r = utUrl.getRequest();
	ajxId.evt.rsp.add(dat.hdallId);
	ajx.evt.rsp.add(dat.hddo);

	if (r.np) {
		dat.pi = -1;	// 取消参考价任务
	}
	if (r.nf) {
		dat.fi = -1;	// 取消基本面任务
	}
	if (r.id) {
		dat.ids = r.id.split(",");
		dat.run();
	} else {
		dat.allId();
	}
}
