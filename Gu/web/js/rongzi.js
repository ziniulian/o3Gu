function calcDay (key, w, td, st, ds) {
	var d, p, et;
	et = st + key * td;

	// 基础时间计算
	if (key < 7) {
		d = key - 0;
		p = 0.001 * key;
	} else {
		d = key / 7 * 5;
		if (d < 30) {
			p = 0.001 * d;
		} else {
			p = 0.03;
		}
	}

	// 特殊时间计算
	if (key > 1) {
		// 忽略周末
		if (key < 7) {
			d += w;
			if (d === 7) {
				d --;
			} else if (d > 7) {
				d -= 2;
			}
			d -= w;
		}

		// 忽略节假日
		for (var i = 0; i < ds.length; i++) {
			if (ds[i] < et && ds[i] > st) {
				d --;
			}
		}
	}

	return {
		day: d,
		pay: p
	};
}

// 刷新页面内容
function flush(s, key, code, day, pay, e) {
	var v, r, t;
	var y = window["hq_str_s_" + s + code];
	this.parentNode.removeChild(this);
	if (y) {
		y = y.split(",")[1];
		v = document.getElementById(s + key + "d");
		if (v) v.innerHTML = day;
		v = document.getElementById(s + key + "c");
		if (v) v.innerHTML = code;
		v = document.getElementById(s + key + "y");
		if (v) v.innerHTML = y;
		v = document.getElementById(s + key + "r");
		if (v) {
			r = (Math.floor((y / 365 * key - pay) / day * 10000) / 100).toString();

			t = r.indexOf(".");
			if (t === -1) {
				r += ".00";
			} else if ((r.length - t) === 2) {
				r += "0";
			}

			v.innerHTML = r;
		}
	}
}

function init() {
	var ip = "http://hq.sinajs.cn/list=s_";
	var head = document.getElementsByTagName("head")[0];
	var t = new Date();
	var td = 24 * 3600 * 1000;
	var st = (Math.floor(t.valueOf() / td) * 24 - 8) * 3600000;
	t.setTime(st);
	var w = t.getDay();
	var conf = {
		sz: {
			"1": "131810",
			"2": "131811",
			"3": "131800",
			"4": "131809",
			"7": "131801",
			"14": "131802",
			"28": "131803",
			"91": "131805",
			"182": "131806"
		},
		sh: {
			"1": "204001",
			"2": "204002",
			"3": "204003",
			"4": "204004",
			"7": "204007",
			"14": "204014",
			"28": "204028",
			"91": "204091",
			"182": "204182"
		},
		days: [
			// 须避开双休日
			// 元旦	1	1-1
			Date.parse("2018/1/1"),

			// 春节	3
			Date.parse("2018/2/15"),
			Date.parse("2018/2/16"),
			Date.parse("2018/2/19"),

			// 清明	1	4-5
			Date.parse("2018/4/5"),
			Date.parse("2018/4/6"),

			// 劳动	1	5-1
			Date.parse("2018/4/30"),
			Date.parse("2018/5/1"),

			// 端午	1
			Date.parse("2018/6/18"),

			// 中秋	1
			Date.parse("2017/10/2"),

			// 国庆	3	10-1
			Date.parse("2017/10/3"),
			Date.parse("2017/10/4"),
			Date.parse("2017/10/5"),
			Date.parse("2017/10/6"),
		]
	};
	var i, s, ajx, r;

	// 时间处理 —— 周末
	if (w === 0) {
		st -= 2 * td;
	} else if (w === 6) {
		st -= td;
	}

	// 时间处理 —— 节假日
	for (i = 0; i < conf.days.length; i++) {
		if (st === conf.days[i]) {
			do {
				st -= td;
				t.setTime(st);
				w = t.getDay();
				if (w === 0) {
					st -= 2 * td;
				} else if (w === 6) {
					st -= td;
				}
				i--;
			} while (st === conf.days[i]);
			break;
		}
	}
	t.setTime(st);
	w = t.getDay();
	document.getElementById("tim").innerHTML = t.getFullYear() + " 年 " + (t.getMonth() + 1) + " 月 " + t.getDate() + " 日<br>国债逆回购收益对比表";

	for (s in conf.sz) {
		r = calcDay (s, w, td, st, conf.days);

		ajx = document.createElement("script");
		ajx.src = ip + "sz" + conf.sz[s];
		ajx.onload = LZR.bind(ajx, flush, "sz", s, conf.sz[s], r.day, r.pay);
		head.appendChild(ajx);

		ajx = document.createElement("script");
		ajx.src = ip + "sh" + conf.sh[s];
		ajx.onload = LZR.bind(ajx, flush, "sh", s, conf.sh[s], r.day, r.pay);
		head.appendChild(ajx);
	}
}
