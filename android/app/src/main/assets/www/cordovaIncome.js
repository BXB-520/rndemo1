/**
 * @Author: BX
 * @Date:   2022-05-31 10:34:01
 * @Last Modified by:   BX
 * @Last Modified time: 2022-06-14 14:52:39
 */
//先判断是否是工作助手环境
//再根据android和ios环境引入不同的js 也可将该corodva文件放到项目本地引入（该文件由工作助手提供）
let ssoToken = '';
const name = 'ssoToken';
const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); //构造一个含有目标参数的正则表达式对象
const r = window.location.search.substr(1).match(reg); //匹配目标参数
if (r != null) {
  ssoToken = unescape(r[2]);
} else {
  ssoToken = null;
}
/** 动态引入cordova包，本身app，工作助手分类 */
let u = navigator.userAgent;
let scriptNode = document.createElement('script');
scriptNode.setAttribute('type', 'text/javascript');
let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; // android终端
let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
if (isIOS && ssoToken) {
  //不考虑ios
  // scriptNode.setAttribute(
  //   'src',
  //   'https://cdt.cq.189.cn/iworkapi/11797607/iworkapi/vpn/cordovajs/IOS/cordova.js',
  // );
} else if (isAndroid && ssoToken) {
  scriptNode.setAttribute(
    'src',
    'https://cdt.cq.189.cn/iworkapi/11797607/iworkapi/vpn/cordovajs/Android/cordova.js',
  );
} else {
  scriptNode.setAttribute('src', 'cordova.js');
}
document.body.appendChild(scriptNode);
