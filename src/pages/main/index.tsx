/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ToastAndroid,
  View,
  useColorScheme,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import RNFS from 'react-native-fs';
import {
  handelWebview,
  handelStatusBarHeight,
  handelCheckPicture,
  handelDelHistory,
  handelDownloadImage,
  HistoryStorage,
  handelCameraPlugin,
  handelQrcode,
  handeluseNfc,
  handelDownloadFile,
  handleOpenWxShare,
} from '../../plugins/index';

function HomeScreen({navigation, route}: any): JSX.Element {
  const webViewRef = useRef<any>(null);
  const nowParams = useRef<any>(null);
  const historyStorage = useRef<any>([]);

  const [canGoBack, setcanGoBack] = useState(false);
  /** 是否离开了主webview */
  const [leave, setLeave] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  /** 图片并压缩转base64 */
  const handelPostPics = async (pictureList: any[]) => {
    let list: any = [];
    await Promise.all(
      pictureList.map(async (items: any) => {
        const base64String = await RNFS.readFile(items.uri, 'base64');
        if (base64String) {
          list.push({
            id: items.id,
            base64: `data:image/png;base64,${base64String}`,
          });
        }
      }),
    );
    list.sort((start: any, end: any) => start.id - end.id);
    postMessageToWeb(
      {
        ...nowParams.current,
        status: '2',
        value: {pictureList: list.map((items: any) => items.base64)},
      },
      true,
    );
  };

  /** 回发扫描的二维码结果 */
  const handelPostQrcode = (qrcodeData: string) => {
    postMessageToWeb(
      {...nowParams.current, status: '2', value: {qrcodeData}},
      true,
    );
  };

  /** webview被关闭了 */
  const handelPostWebview = (webview: string) => {
    postMessageToWeb({...nowParams.current, status: '2', value: webview}, true);
  };

  useEffect(() => {
    switch (true) {
      case !!route.params?.pictureList:
        handelPostPics(route.params?.pictureList);
        break;
      case !!route.params?.qrcodeData:
        handelPostQrcode(route.params?.qrcodeData);
        break;
      case !!route.params?.webView:
        handelPostWebview(route.params?.webView);
        break;
      default:
        // 处理其他情况
        break;
    }
  }, [route.params]);

  /** 控制系统路由返回 */
  useEffect(() => {
    let backHandlerPressedCount: number = 0;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (backHandlerPressedCount < 1) {
          if (leave) {
            setLeave(false);
            return false;
          }

          if (canGoBack) {
            backHandlerPressedCount++;
            ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
            setTimeout(() => {
              backHandlerPressedCount = 0;
            }, 2000);
            return true;
          } else {
            if (historyStorage.current.length) {
              const params = historyStorage.current.pop();
              postMessageToWeb({...params, status: '2', value: 'true'}, true);
              return true;
            }
            webViewRef.current.goBack();
            return true;
          }
        } else {
          backHandlerPressedCount = 0;
          BackHandler.exitApp();
          return false;
        }
      },
    );

    return () => backHandler.remove();
  }, [canGoBack, leave]);

  /** 到首页执行 */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLeave(false);
    });
    return unsubscribe;
  }, [navigation]);

  /** webview路由变化执行 */
  const handleNavigationStateChange = (navState: {canGoBack: boolean}) => {
    setcanGoBack(!navState.canGoBack);
  };

  const onMessage = (event: WebViewMessageEvent) => {
    // const data = JSON.parse(event.nativeEvent.data);
    // if (data.type === 'copy') {
    //   // 阻止默认行为
    //   event.preventDefault();
    //   // 在此处可以执行自定义操作
    // }

    let data = event.nativeEvent.data;
    console.log('onMessage ', event.nativeEvent.data);
    let params = null;
    try {
      params = JSON.parse(data);
    } catch (e) {
      console.warn('json parse error!! data = ' + data);
    }
    if (!params) {
      return;
    }
    console.log('params', params);

    // 可以根据params.modelName来判断处理什么业务
    disposeWebMessage(params);
  };

  /** 业务判断 */
  const disposeWebMessage = async (params: any) => {
    switch (params.modelName) {
      case 'Webview': //Webview 返回状态1 2
        const resultWebview = handelWebview(
          params,
          setLeave,
          navigation,
          nowParams,
        );
        postMessageToWeb(resultWebview);
        break;
      case 'StatusBarHeight': //StatusBarHeight 返回状态1
        const resultHeight = handelStatusBarHeight(params);
        postMessageToWeb(resultHeight, true);
        break;
      case 'CheckPicture': //CheckPicture 返回状态1 2
        const resultCheckPicture = handelCheckPicture(
          params,
          setLeave,
          navigation,
          nowParams,
        );
        postMessageToWeb(resultCheckPicture);
        break;
      case 'DelHistory': //DelHistory 返回状态1
        const resultDelHistory = handelDelHistory(params, setcanGoBack);
        postMessageToWeb(resultDelHistory, true);
        break;
      case 'DownloadImage': //DownloadImage 返回状态0 1 2
        const resultDownloadImage: any = await handelDownloadImage(
          params,
          postMessageToWeb,
        );
        postMessageToWeb(resultDownloadImage, true);
        break;
      case 'DownloadFile': //DownloadFile 返回状态0 1 2
        const resultDownloadFile: any = await handelDownloadFile(
          params,
          postMessageToWeb,
        );
        postMessageToWeb(resultDownloadFile, true);
        break;
      case 'HistoryStorage': //HistoryStorage 返回状态1 2
        const resultStorage = HistoryStorage(params, historyStorage);
        postMessageToWeb(resultStorage);
        break;
      case 'UseCamera': //UseCamera 返回状态0 1 2
        const resultCamera: any = await handelCameraPlugin(
          params,
          postMessageToWeb,
        );
        postMessageToWeb(resultCamera, true);
        break;
      case 'Qrcode': //Qrcode 返回状态1 2
        const resultQrcode = handelQrcode(
          params,
          setLeave,
          navigation,
          nowParams,
        );
        postMessageToWeb(resultQrcode);
        break;
      case 'UseNfc': //UseNfc 返回状态1 2
        const resultUseNfc: any = await handeluseNfc(params, postMessageToWeb);
        postMessageToWeb(resultUseNfc, true);
        break;
      case 'WxShare': //WxShare 返回状态0 1
        const resultWxShare: any = await handleOpenWxShare(params);
        postMessageToWeb(resultWxShare, true);
        break;

      default:
        break;
    }
  };

  /**
   * 封装了webview进行函数回调的方式
   * params   H5调用时候的参数，包含了functionId和modelName
   * value	需要返回的value对象
   */
  const postMessageToWeb = (
    params: {
      status?: string;
      message?: string;
      model?: any;
      value?: any;
      functionId?: string;
    },
    needClear?: boolean,
  ) => {
    const response = {
      functionId: params.functionId,
      model: params.model ?? 200,
      status: params.status ?? '1', //0:失败 1:成功 2:异步数据
      value: params.value ?? undefined,
      message: params.message ?? 'success',
      delete: needClear, //通信完成是否删除
    };
    const responseStr = JSON.stringify(response);
    console.log('response', responseStr);

    const jsString = `(function() {window.RN_WebViewBridge && window.RN_WebViewBridge.onMessage(${responseStr});})()`;
    webViewRef.current?.injectJavaScript(jsString);
    /** 通信完成是否删除 */
    if (needClear) {
      nowParams.current = null;
    }
  };

  useEffect(() => {}, []);

  return (
    <View style={backgroundStyle}>
      <StatusBar
        backgroundColor={'#ffffff00'}
        barStyle="light-content"
        translucent={true}
      />
      {/* <View>
      <Text>My WebView Title</Text>
    </View>

    <Button
      title="Go to Details"
      onPress={async () => {
        12
      }}
    /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <WebView
          ref={webViewRef}
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          originWhitelist={['*']}
          javaScriptEnabled={true}
          onNavigationStateChange={handleNavigationStateChange}
          //source={{uri: 'http://1.14.44.66:2748'}}
          source={{uri: 'http://www.qweryui.top:10010'}}
          // source={
          //   Platform.OS === 'ios'
          //     ? require('../../assets/www/index.html')
          //     : {
          //         uri: 'file:///android_asset/dist/index.html',
          //       }
          // }
          useWebKit={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          overScrollMode="never" //安卓去除白色拉动动画
          scrollEnabled
          onContentProcessDidTerminate={() => {
            webViewRef.current.reload();
          }}
          // userAgent={
          //   'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
          //   // 'Mozilla/5.0 (Mac OS X NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
          // }
          onMessage={onMessage}
          style={{
            flex: 1,
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

export default HomeScreen;
