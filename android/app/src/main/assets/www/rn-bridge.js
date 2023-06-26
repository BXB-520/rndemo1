/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// 回调函数的map，用于app回调结果后，将结果返回给调用者，数据格式：<string, object>，
// 其中object：{model:string,functionId:string,success:function,compile:function,fail:function}
var mCallbackFunctionMap = new Map();

window.RN_WebViewBridge = {
    onMessage: function (data) {
        RNCallback(data);
    },
    // app在加载网页时候，会第一时间通过WebVeiw的injectedJavaScript执行这个函数，此时将mIsRNApp设置为true
    onRNApp: function () {
        mIsRNApp = true;
    },
};

/**
 * app执行后的结果回调
 * @param result  回调结果（对象）
 */
function RNCallback(result) {
    var callbackFun = mCallbackFunctionMap.get(result.functionId);

    mCallbackFunctionMap.delete(result.functionId);
    // 客户端会对请求进行判断，返回‘0’表示业务操作成功
    if (result.status === '0') {
        callbackFun.success && callbackFun.success(result.value);
    } else {
        callbackFun.fail && callbackFun.fail(result.value);
    }
    callbackFun.compile && callbackFun.compile(result.value);
}

/**
 *
 * modelName  在RN客户端中会根据modelName来进行具体的业务操作
 */
function requestRN(modelName, requestParams) {
    var functionId = `${modelName}-${Date.now()}`;
    requestParams = { ...requestParams, functionId, modelName };
    /** 保存目前请求 */
    mCallbackFunctionMap.set(functionId, requestParams);
    // 将请求通过postMessage发送给RN客户端
    window.ReactNativeWebView.postMessage(JSON.stringify(requestParams));
}
