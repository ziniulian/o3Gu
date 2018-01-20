LZR.load([
	"LZR.HTML.Base.Ajax"
]);

var lzr_domain = {
	urls: {
		main: LZR.HTML.domain
	},

	getUrl: function (ids, cb) {
		if (ids) {
			var url = LZR.HTML.domain + "Domain/srvGet/" + ids;
			var ajx = new LZR.HTML.Base.Ajax ();
			ajx.evt.rsp.add(LZR.bind(ajx, lzr_domain.hdUrl, cb));
			ajx.get(url, true);
		} else {
			cb(LZR.HTML.domain);
		}
	},

	hdUrl: function (cb, txt, sta) {
		if (sta === 200) {
			var d = this.utJson.toObj(txt);
			if (d.ok) {
				d.dat.main = LZR.HTML.domain;
				lzr_domain.urls = d.dat;
			}
		}
		cb(lzr_domain.urls);
	}
};
