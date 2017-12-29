LZR.load([
	"LZR.HTML.Base.Ajax"
]);

var lzr_domain = {
	getUrl: function (key, cb) {
		if (key) {
			var url = LZR.HTML.domain + "/Domain/srvGet/" + key;
			var ajx = new LZR.HTML.Base.Ajax ();
			ajx.evt.rsp.add(LZR.bind(ajx, lzr_domain.hdUrl, cb));
			ajx.get(url, true);
		} else {
			cb(LZR.HTML.domain);
		}
	},

	hdUrl: function (cb, txt, sta) {
		var r = "";
		if (sta === 200) {
			var d = this.utJson.toObj(txt);
			if (d.ok) {
				r = d.dat;
			}
		}
		cb(r);
	}
};
