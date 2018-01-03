// 基本面新增数据

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var dat = {
	busy: false,

	sub: function (txt) {
		if (!dat.busy) {
			var i, r, url;
			var a = txt.match(/(\d{6})/g);
			// console.log(a);
			if (a) {
				dat.busy = true;
				r = a[0];
				for (i = 1; i < a.length; i ++) {
					r += ",";
					r += a[i];
				}
				url = "srvAddIds/" + r;
				ajx.get(url, true);
			}
		}
		idDom.value = "";
	},

	hdsub: function (txt) {
		var d = utJson.toObj(txt);
		if (d.ok) {
			d = d.dat;
			var r = "";
			for (var i = 0; i < d.length; i ++) {
				if (d[i].typ === 1) {
					if (r) {
						r += ",";
					}
					r += d[i].id;
				}
			}
			if (r) {
				location.href = "baseFlush.html?do=1&id=" + r;
			}
		}
		dat.busy = false;
	}

}

function init() {
	ajx.evt.rsp.add(dat.hdsub);
}
