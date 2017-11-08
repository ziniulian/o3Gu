LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);

function init() {
	qry();
}

function qry() {
	var url = "getBaiduK/" + typ.value + "/" + cod.value;
	var o = utJson.toObj(ajx.get(url));
	var n = o.length - 2;
	var v = 0;
	var c = 0;
	var min = 0;
	var max = 0;
	tb.innerHTML = "";
	for (var i = 0; i <= n; i ++) {
		var a = o[i].split(",");
		var r = document.createElement("tr");

		var d = document.createElement("td");
		d.innerHTML = a[0];
		r.appendChild(d);

		d = document.createElement("td");
		d.innerHTML = a[1];
		r.appendChild(d);

		d = document.createElement("td");
		v = a[4].indexOf("%");
		d.innerHTML = a[4].substr(0, v);
		r.appendChild(d);

		d = document.createElement("td");
		v = a[5].indexOf("万");
		if (v > 0) {
			v = a[5].substr(0, v) * 100;
		} else {
			v = a[5].indexOf("亿");
			if (v > 0) {
				v = a[5].substr(0, v) * 1000000;
			} else {
				v = a[5] / 100;
			}
		}
		v = Math.round(v);
		d.innerHTML = v;
		r.appendChild(d);

		// 数据统计
		if (i !== n) {
			c += v;
			if (min === 0 || min > v) {
				min = v;
			}
		}
		if (max < v) {
			max = v;
		}

		tb.appendChild(r);
	}

	switch (typ.value) {
		case "D":
			total.innerHTML = c + v;
			break;
		default:
			total.innerHTML = min + " , " + Math.floor(c/n) + " , " + max;
	}
}
