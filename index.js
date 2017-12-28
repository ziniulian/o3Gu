// LZR 模块加载
require("lzr");

// LZR 子模块加载
LZR.load([
	"LZR.Node.Srv",
	"LZR.Node.Srv.DomainSrv"
]);

// 域名服务
var utDma = LZR.getSingleton(LZR.Node.Srv.DomainSrv);

// 服务的实例化
var srv = new LZR.Node.Srv ({
	ip: process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0",
	port: process.env.OPENSHIFT_NODEJS_PORT || 80
});

// LZR库文件访问服务
srv.ro.setStaticDir("/myLib/", LZR.curPath);

// LOGO图片
srv.ro.get("/favicon.ico", function (req, res) {
	res.redirect(utDma.get() + "/favicon.ico");
});

// 股
srv.use("/Gu/", require("./Gu"));

// 回首页
srv.ro.get("/lzrhome/", function (req, res) {
	res.redirect(utDma.get());
});

// 追踪器
srv.ro.get("/trace.js", function (req, res) {
	res.redirect(utDma.get() + "/js/trace.js");
});

// 收尾处理
srv.use("*", function (req, res) {
	res.redirect(utDma.get() + "/Err");
});

// 服务启动
srv.start();
console.log("LZRgu start " + srv.ip + ":" + srv.port);
