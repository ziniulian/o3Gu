// 基本面详情页

LZR.load([
	"LZR.Base.Json",
	"LZR.Base.Math",
	"LZR.Base.Time",
	"LZR.HTML.Base.Ajax",
	"LZR.HTML.Util.Url"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utMath = LZR.getSingleton(LZR.Base.Math);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);
var utTim = LZR.getSingleton(LZR.Base.Time);
var dat = {
	busy: false,
	db: null,
	y: false,	// 年

	get: function (id) {
		if (id && !dat.busy) {
			dat.busy = true;
			var url = "srvGet/" + id;
			ajx.get(url, true);
		}
	},

	hdget: function (txt) {
		var d = utJson.toObj(txt);
		if (d.ok) {
			d = d.dat[0];
			namSdom.innerHTML = d.nam + " ( " + d.id + " ) ";
			dat.db = d.balance;
			dat.flush();
		} else {
			tbs.innerHTML = "暂无数据";
		}
		dat.busy = false;
	},

	setY: function (yy) {
		if (dat.db && dat.y !== yy) {
			dat.y = yy;
			dat.flush();
		}
	},

	flush: function () {
		tbs.innerHTML = "";
		var o = dat.db;
		for (var i = 0; i < o.tim.length; i ++) {
			var t = new Date(utTim.parseDayTimestamp(o.tim[i]));
			if (dat.y && t.getMonth() === 11) {
				dat.show(o, i, t.getFullYear());
			} else if (!dat.y) {
				dat.show(o, i, t.getFullYear() + "-" + ((t.getMonth() + 1) / 3));
			}
		}
	},

	show: function (o, i, tim) {
		var r = document.createElement("tr");
		var d = document.createElement("td");
		d.innerHTML = tim;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.p[i];
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.roe[i] + "%";
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.ass[i];
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = utMath.formatFloat(o.ass[i] - o.pf[i] - o.up[i], 2);
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = utMath.formatFloat(o.ass[i] + o.pf[i] + o.up[i], 2);
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.inc[i];
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.pf[i];
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.up[i];
		r.appendChild(d);
		tbs.appendChild(r);
	}

}

function init() {
	var r = utUrl.getRequest();
	ajx.evt.rsp.add(dat.hdget);
	if (r.id) {
		dat.get(r.id);
	}
}
