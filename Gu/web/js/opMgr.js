// 自选股管理

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.Base.Math"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var ajxop = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var dat = {
	busy: false,

	flush: function () {
		if (!dat.busy) {
			dat.busy = true;
			tbs.innerHTML = "";
			var url = "srvGetOp/";
			ajx.get(url, true);
		}
	},

	hdflush: function (txt) {
		var d = utJson.toObj(txt);
		var i, j, id;
		if (d.ok) {
			for (i = 0; i < d.dat.length; i ++) {
				id = d.dat[i].id;
				for (j = 0; j < d.msg.length; j ++) {
					if (d.msg[j] === id) {
						d.msg[j] = d.dat[i];
						break;
					}
				}
			}
			for (i = 0; i < d.msg.length; i ++) {
				dat.show(d.msg[i]);
			}
		} else {
			tbs.innerHTML = "<br />暂无数据";
		}
		dat.busy = false;
	},

	show: function (o) {
		var r = document.createElement("tr");
		var d = document.createElement("td");
		if (o.typ === 1) {
			d.innerHTML = "<a href='opOne.html?id=" + o.id + "'>" + o.id + "</a>";
		} else {
			d.innerHTML = "<a>" + o.id + "</a>";
		}
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = o.nam;
		r.appendChild(d);
		d = document.createElement("td");
		d.innerHTML = "<a href='javascript: dat.del(\"" + o.id + "\");'>删除</a>";
		r.appendChild(d);
		tbs.appendChild(r);
	},

	add: function (id) {
		if (!dat.busy) {
			dat.busy = true;
			var url = "srvAddOp/" + id;
			ajxop.get(url, true);
		}
		idDom.value = "";
	},

	del: function (id) {
		if (!dat.busy) {
			dat.busy = true;
			var url = "srvDelOp/" + id;
			ajxop.get(url, true);
		}
	},

	hdop: function (txt, sta) {
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				dat.busy = false;
				dat.flush();
			}
		}
		dat.busy = false;
	}

}

function init() {
	idDom.onkeyup = function (e) {
		if (e.keyCode === 13) {
			// 回车键
			dat.add(idDom.value);
		}
	};
	ajx.evt.rsp.add(dat.hdflush);
	ajxop.evt.rsp.add(dat.hdop);
	dat.flush();

	lzr_tools.trace();
}
