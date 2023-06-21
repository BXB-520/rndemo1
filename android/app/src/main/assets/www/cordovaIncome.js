//根据android和ios环境引入不同的js
let isOutSide = '';
const name = 'isOutSide';
const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); //构造一个含有目标参数的正则表达式对象
const r = window.location.search.substr(1).match(reg); //匹配目标参数
if (r != null) {
  isOutSide = unescape(r[2]);
} else {
  isOutSide = null;
}
/** 动态引入cordova包 */
let u = navigator.userAgent;
let scriptNode = document.createElement('script');
scriptNode.setAttribute('type', 'text/javascript');
let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; // android终端
let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
if (isIOS && isOutSide) {
  scriptNode.setAttribute(
    'src',
    '暂不提供',
  );
} else if (isAndroid && isOutSide) {
  scriptNode.setAttribute(
    'src',
    'http://114.132.187.155:8082/webview/android/cordova.js',
  );
} else {
  scriptNode.setAttribute('src', 'cordova.js');
}
document.body.appendChild(scriptNode);
