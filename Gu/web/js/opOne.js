// 自选股详情

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.Base.Math"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utMath = LZR.getSingleton(LZR.Base.Math);
var dat = {
	busy: false,
	fidld: null,	// 排序的栏位，初次排序统一从大到小排
	sort: false,	// false，从大到小，true，从小到大
	ds: null,

	flush: function () {
		if (!dat.busy) {
			dat.busy = true;
			var url = "srvGetByTim/" + secYear.value + "/" + secQuar.value;
			ajx.get(url, true);
		}
	},

	hdflush: function (txt) {
		var d = utJson.toObj(txt);
		if (d.ok) {
			dat.ds = [];
			var t = d.msg;
			var i, o, j, dd;
			d = d.dat;
			for (i = 0; i < d.length; i ++) {
				dd = d[i];
				o = {
					id: dd.id,
					nam: dd.nam
				};
				dd = dd.balance;
				for (j = 0; j < dd.tim.length; j ++) {
					if (dd.tim[j] == t) {
						break;
					}
				}
				o.p = dd.p[j];
				o.roe = dd.roe[j];
				o.ass = dd.ass[j];
				o.pf = dd.pf[j];
				o.up = dd.up[j];
				o.inc = dd.inc[j];
				o.ta = utMath.formatFloat(o.ass - o.pf - o.up, 2);
				o.fa = utMath.formatFloat(o.ass + o.pf + o.up, 2);
				dat.ds.push(o);
			}
			// console.log(dat.ds);
			dat.qry("fa", true);
		} else {
			tbs.innerHTML = "<br />暂无数据";
		}
		dat.busy = false;
	},

	show: function (o) {
		var r = document.createElement("tr");
		var d = document.createElement("td");
		d.innerHTML = "<a href='baseOne.html?id=" + o.id + "'>" + o.id + "</a>";
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.nam;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.p;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.roe + "%";
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.ass;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.ta;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.fa;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.inc;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.pf;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.up;
		r.appendChild(d);
		tbs.appendChild(r);
	},

	qry: function (fid, redo) {
		var i, j, t;
		var d = document.getElementById(dat.fidld + "Sdom");
		if (!redo && fid === dat.fidld) {
			dat.sort = !dat.sort;
		} else {
			if (d) {
				d.innerHTML = "";
			}
			dat.fidld = fid;
			dat.sort = false;
			d = document.getElementById(dat.fidld + "Sdom");

			// 从大到小的排序
			for (i = dat.ds.length; i > 1; i --) {
				for (j = 1; j < i; j ++) {
					if (dat.ds[j - 1][fid] < dat.ds[j][fid]) {
						t = dat.ds[j];
						dat.ds[j] = dat.ds[j - 1];
						dat.ds[j - 1] = t;
					}
				}
			}
		}

		// 刷新页面
		tbs.innerHTML = "";
		if (dat.sort) {
			d.innerHTML = "↑";
			for (i = dat.ds.length - 1; i >= 0; i --) {
				dat.show(dat.ds[i]);
			}
		} else {
			d.innerHTML = "↓";
			for (i = 0; i < dat.ds.length; i ++) {
				dat.show(dat.ds[i]);
			}
		}
	}
}

function init() {
	var t = new Date();
	var y = t.getFullYear();
	var m = t.getMonth();
	var i, d, j = 0;

	// 初始化选项
	for (i = 2016, j = -1; i <= y; i ++, j++) {
		d = document.createElement("option");
		d.innerHTML = i + "年";
		d.value = i;
		secYear.appendChild(d);
	}
	if (m > 9) {
		m = 2;
	} else if (m > 6) {
		m = 1;
	} else if (m > 3) {
		m = 0;
	} else {
		m = 3;
		j --;
	}
	secYear[j].selected = true;
	secQuar[m].selected = true;

	ajx.evt.rsp.add(dat.hdflush);
	dat.flush();
}
