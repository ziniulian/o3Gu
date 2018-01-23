// LZR 模块加载
require("lzr");

// LZR 子模块加载
LZR.load([
	"LZR.Node.Srv",
	"LZR.Node.Srv.DomainSrv"
]);

// 域名
var dmsrv = new LZR.Node.Srv.DomainSrv ({
	// // 获取域名后的回调
	// hd_fun: function (r) {
	// 	// Ajax
	// 	ajax = new LZR.Node.Db.NodeAjax ({
	// 		hd_sqls: {
	// 			vs: dmsrv.ds.vs + "srvTrace/<0>/0/<1>"
	// 		}
	// 	});
	// },
	hd_ids: "vs"
});

// 服务的实例化
var srv = new LZR.Node.Srv ({
	ip: process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0",
	port: process.env.OPENSHIFT_NODEJS_PORT || 80
});

// LZR库文件访问服务
srv.ro.setStaticDir("/myLib/", LZR.curPath);

// LOGO图片
srv.ro.get("/favicon.ico", function (req, res) {
	res.redirect(dmsrv.ds.main + "favicon.ico");
});

// 公共样式
srv.ro.get("/base.css", function (req, res) {
	res.redirect(dmsrv.ds.main + "css/common/base.css");
});

// 通用工具
srv.ro.get("/tools.js", function (req, res) {
	res.redirect(dmsrv.ds.main + "js/tools.js");
});

// 股
srv.use("/Gu/", require("./Gu"));

// 收尾处理
srv.use("*", function (req, res) {
	res.redirect(dmsrv.ds.main + "Err");
});

// 服务启动
srv.start();
console.log("LZRgu start " + srv.ip + ":" + srv.port);
