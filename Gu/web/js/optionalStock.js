function init() {
    var d = window.lzr_optionalStock_dat;
    d.unshift(d.length);
    qry(d);
}

function qry(d) {
    var ip = "http://hq.sinajs.cn/list=s_";
    var head = document.getElementsByTagName("head")[0];
    var ajx;
    for (var i = 1; i < d.length; i++) {
        ajx = document.createElement("script");
		ajx.src = ip + d[i].num;
		ajx.onload = LZR.bind(d[i], hd, d);
		head.appendChild(ajx);
    }
}

function hd(d, e) {
    // 记录数据
    var y = window["hq_str_s_" + this.num].split(",");
    this.np = y[1] - 0;
    this.nv = y[4] - 0;
    this.pct = y[3] - 0;
    d[0] --;

    // 清空 JSONP DOM
    var ajx = e.target;
    ajx.parentNode.removeChild(ajx);

    // 刷新页面
    if (d[0] === 0) {
        flush(d);
    }
}

// 填充表格
function flush(d) {
    var s;
    var r = "";
    for (var i = 1; i < d.length; i++) {
        s = "<tr><td class = \"nam\">";
        s += d[i].alia;

        s += "</td><td class = \"gain\">";
        if (d[i].p) {
            s += Math.floor(((d[i].np - d[i].p * 1.01) * d[i].v * 100));
        }

        s += "</td><td class = \"np";
        if (d[i].min) {
            if (d[i].np <= d[i].min) {
                s += " stop\">";
            } else if (d[i].np >= d[i].max) {
                s += " go\">";
            } else {
                s += "\">";
            }
            s += d[i].min + " < " + d[i].np + " < " + d[i].max;
        } else {
            s += "\">" + d[i].np;
        }

        s += "</td><td class = \"nv";
        if (d[i].vmin) {
            if (d[i].nv <= d[i].vmin) {
                s += " go\">";
            } else if (d[i].nv >= d[i].vmax) {
                s += " warm\">";
            } else {
                s += "\">";
            }
            s += d[i].vmin + " < " + d[i].nv + " < " + d[i].vmax;
        } else {
            s += "\">" + d[i].nv;
        }

        s += "</td><td class = \"pct\">";
        s += d[i].pct;
        s += "</td></tr>";
        r += s;
    }
    optionalStock.innerHTML = r;
}

// 刷新
function refresh() {
    var d = window.lzr_optionalStock_dat;
    d[0] = d.length - 1;
    qry(d);
}
