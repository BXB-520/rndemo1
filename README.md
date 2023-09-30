# ReactNative APP

# 项目说明：本项目为 ReactNative 所搭建的基础框架，采用内嵌 H5 运行 APP，H5 所需的硬件功能一律采用 RN 通信与 H5 进行交互，请使用配套的 H5 框架（UMIAPP-VANT）进行开发

项目启动
依赖 1.yarn 默认运行 postinstall 便捷 mac 开发， 不影响 win
调试 2.yarn android / ios
打包 3.安卓 cd android 然后./gradlew assembleRelease，ios 请使用 xcode 修改模式为 relase 然后进行打包

判断是调试还是正式，调试包摇晃手机会出现配置菜单

# 注意事项

1....

# 关于嵌入 H5 请参考 ReactNative 框架接入文档

**项目文件需遵循项目目录结构说明进行创建，大致项目目录如图所示（根据项目适当调整）：**

```
android  #安卓项目文件
 |
ios #苹果项目文件
 │
public #公共项目文件
 │
src
 │
 ├─assets #静态资源
 │  │
 │  ├─fonts #字体
 │  │
 │  ├─icons #图标
 │  │
 │  └─imgs #图片
 │
 ├─components #全局组件
 │  │
 │  ├─business #业务组件
 │  │
 │  └─common #公共组件
 │
 ├─constants #系统常量
 │  └─index.ts #全局常量
 │
 ├─hooks #自定义hooks
 │  └─index.ts
 │
 ├─pages #路由组件
 │  │
 │  ├─other #其它页面
 │  │
 │  └─main #app首页
 │
 │
 ├─plugins #公共插件
 │  └─index.ts 封装插件
 │
 └─promise #权限方法
    └─权限名称promise.ts #权限方法


```
