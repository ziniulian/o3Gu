# o3Gu
股票服务
=======

*******************************************************************

缓存：
-------------------------------------------------------------------

- 原服务在 openshift online 3 上的重新部署
- 盘量分析
- 导入基本面数据
- 更新基本面的参考价
- 新增自选股
- 更新基本面信息可以不返回详细结果
- 基本面查询与分析
- 基本面更新页面，需前端一个个循环执行，若直接用服务接口全部操作会导致连接超时
- 自选股信息的修改
- 显示自选股信息
- 盘量分析刷新后，滚动条定位到成交价处
- 盘量分析的BUG：代码输错时的容错性。
- 基本面查询，修正第三季度计算条件错误的问题
- 基本面查询，默认以真净资产排序
- 基本面新增数据，避免指数的数据更新，只更新股票数据
- 更新基本面数据，加参数才能自动运行，否则不要自启动
- 自选股查询，价格显示，保证两位小数，盈亏取整
- 自选股查询，加缓冲页面
- 自选股查询，加分隔线
- 基本面查询，显示总数
- 更新基本面的参考价接口，防止价格为 0 的数据更新
- 获取代码总数，保证总数为0时，状态为true
- 统一调用主服务样式
- 将 domain.js 加入统一的工具类，使用统一的工具类。
- 增加一点权限的控制
- 基本面添加每股收益及同比
- 基本面取消净资产收益率选项

*******************************************************************

计划：
-------------------------------------------------------------------

- 添加自选股接口，改为可批量添加
- 自选股页面，新增复制所有代码功能
- 添加功能：清除没有基本面信息的错误代码
- 盘量分析的BUG：当只有买一和卖一时，或涨跌停板没有卖盘或买盘时出错问题。
- 自选股添加排序功能

*******************************************************************





开发明细：
-------------------------------------------------------------------

##### 2018-8-17 （ 添加GPL许可 ）：

##### 2018-8-9 （ 改用HTTPS ）：

##### 2018-1-26 （ 上调止损价 ）：
	上调止损价
	在新页面中打开自选股详情

##### 2018-1-24 （ 暂不使用域名服务 ）：
	暂不使用域名服务
	删除时间测试功能

##### 2018-1-23 （ 使用通用样式及工具 ）：
	使用通用样式及工具
	首页进行权限区分
	基本面添加收益同比
	基本面取消净资产收益率

##### 2018-1-19 （ BUG修正 ）：
	修正自选股设置时的数量重复叠加问题
	修正量、价颜色无法恢复问题

##### 2018-1-5 （ 添加追踪器 ）：
	添加追踪器
	主页使用新域名结构
	公用样式重命名

##### 2018-1-4 （ 不再使用LZR库的域名服务类 ）：
	不再使用LZR库的域名服务类
	自选股查询，加分隔线
	基本面查询，显示总数
	更新基本面的参考价接口，防止价格为 0 的数据更新
	新增 获取代码总数 接口

##### 2018-1-3 （ BUG修正 ）：
	基本面查询 : 默认以真净资产排序，修正第三季度计算条件错误的问题
	基本面新增数据 : 避免指数的数据更新，只更新股票数据
	更新基本面数据 : 加参数才能自动运行，否则不要自启动
	自选股查询 : 加缓冲页面，价格显示，保证两位小数，盈亏取整

##### 2018-1-3 （ 自选股 ）：
	完成自选股功能
	自选股管理 : 按排序显示内容
	盘量分析 : 滚动条定位

##### 2017-12-29 （ 自选股管理页 ）：
	自选股管理页

##### 2017-12-28 （ 基本面查询 ）：
	完成基本面查询功能

##### 2017-12-7 （ 解决盘量分析卡死问题 ）：
	hdpan ： 解决盘量分析卡死问题

##### 2017-12-4 （ 完成自选股接口 ）：
	完成自选股所需的增删改查接口

##### 2017-12-1 （ 新增净资产收益率 ）：
	数据结构 ： 新增净资产收益率 ROE
	规范返回值结构
	完成接口 更新基本面的参考价
	完成接口 获取所有代码
	完成接口 获取信息
	时间测试
	更新基本面的参考价

##### 2017-11-29 （ 盘量分析使用 Ajax 异步调用 ）：
	hdpan ： 盘量分析使用 Ajax 异步调用

##### 2017-11-29 （ 盘量分析解决空值问题 ）：
	hdpan ： 盘量分析解决空值问题

##### 2017-11-28 （ 盘量分析加入缓冲页面 ）：
	hdpan ： 盘量分析加入缓冲页面

##### 2017-11-28 （ 盘量分析 ）：
	hdpan ： 盘量分析

##### 2017-11-8 （ 初建 ）：
	初建

*******************************************************************
