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
  Button,
  Platform,
  StatusBar,
  Text,
  ToastAndroid,
  View,
  useColorScheme,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ImagePickerResponse, launchCamera} from 'react-native-image-picker';
import RNFS, {downloadFile} from 'react-native-fs';
import {hasCameraPermission} from '../../promise/cameraPromise';
import {
  handelWebview,
  handelStatusBarHeight,
  handelCheckPicture,
  handelDelHistory,
  handelDownloadImage,
  HistoryStorage,
  cameraPlugin,
  handelCameraPlugin,
  handelQrcode,
} from '../../plugins/index';
import {
  getApiVersion,
  isWXAppInstalled,
  openWXApp,
  registerApp,
  shareImage,
  shareText,
  shareWebpage,
} from 'react-native-wechat-lib';
import downloadFiless from '../../plugins/a';
import {DownloadFile} from '../../function/downloadFile';

function HomeScreen({navigation, route}: any): JSX.Element {
  const webViewRef = useRef<any>(null);
  const nowParams = useRef<any>(null);
  const historyStorage = useRef<any>([]);

  const [canGoBack, setcanGoBack] = useState(false);
  const [levl, setlevl] = useState(false);

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
      {...nowParams.current, model: 200},
      {pictureList: list.map((items: any) => items.base64)},
    );
  };

  /** 回发扫描的二维码结果 */
  const handelPostQrcode = (qrcodeData: string) => {
    postMessageToWeb(
      {...nowParams.current, model: 200},
      {qrcodeData: qrcodeData},
    );
  };

  useEffect(() => {
    switch (true) {
      case !!route.params?.pictureList:
        handelPostPics(route.params?.pictureList);
        break;
      case !!route.params?.qrcodeData:
        handelPostQrcode(route.params?.qrcodeData);
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
          if (levl) {
            setlevl(false);
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
              postMessageToWeb({...params, model: 200}, true);
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
  }, [canGoBack, levl]);

  /** 到首页执行 */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setlevl(false);
    });
    return unsubscribe;
  }, [navigation]);

  /** webview路由变化执行 */
  const handleNavigationStateChange = (navState: {canGoBack: boolean}) => {
    setcanGoBack(!navState.canGoBack);
  };

  const onMessage = (event: WebViewMessageEvent) => {
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
    // 可以根据params.modelName来判断处理什么业务
    disposeWebMessage(params);
  };

  const disposeWebMessage = async (params: any) => {
    switch (params.modelName) {
      case 'Webview':
        const resultWebview: any = handelWebview(params, setlevl, navigation);
        postMessageToWeb(resultWebview, resultWebview.value);
        break;
      case 'StatusBarHeight':
        const resultHeight = handelStatusBarHeight(params);
        postMessageToWeb(resultHeight, resultHeight.value);
        break;
      case 'CheckPicture':
        handelCheckPicture(params, setlevl, navigation, nowParams);
        break;
      case 'DelHistory':
        const resultDelHistory = handelDelHistory(params, setcanGoBack);
        postMessageToWeb(resultDelHistory, resultDelHistory.value);
        break;
      case 'DownloadImage':
        const resultDownloadImage: any = await handelDownloadImage(params);
        postMessageToWeb(resultDownloadImage, resultDownloadImage.value);
        break;
      case 'HistoryStorage':
        HistoryStorage(params, historyStorage);
        break;
      case 'UseCamera':
        const resultCamera: any = await handelCameraPlugin(params);
        postMessageToWeb(resultCamera, resultCamera.value);
        break;
      case 'Qrcode':
        handelQrcode(params, setlevl, navigation, nowParams);
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
      model: any;
      value?: string;
      params?: {url: string; title: string} | {ImageList: any[]};
      functionId?: string;
    },
    value: any,
  ) => {
    let response = {
      model: params.model,
      functionId: params.functionId,
      value: value ? value : undefined,
      status: value?.status ? value?.status : '0', //默认都返回0表示js-sdk调用成功，当value中有status时，则使用value中的status
      message: `${params.model}:ok`,
    };
    let responseStr = JSON.stringify(response);
    const jsString = `(function() {window.RN_WebViewBridge && window.RN_WebViewBridge.onMessage(${responseStr});})()`;
    webViewRef.current?.injectJavaScript(jsString);
    nowParams.current = null;
  };

  useEffect(() => {
    console.log('');

    // RNFetchBlob.config({
    //   // add this option that makes response data to be stored as a file,
    //   // this is much more performant.
    //   Token: 'PHONE_oiiqxfzeyrwtquvwnypnrbae',
    //   fileCache: true,
    // })
    //   .fetch(
    //     'GET',
    //     'http://219.153.117.192:9999/api/service-obs/auth/FileController/annexDownload?annexId=1676064290722844673&fileName=%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86%E6%B8%85%E5%8D%95%E8%A1%A820230404.xlsx',
    //     {
    //       //some headers ..
    //     },
    //   )
    //   .then(res => {
    //     // the temp file path
    //     console.log('The file saved to ', res.path());
    //   });

    // registerApp('wxfdb7bc274f114f9b', 'universalLink').then(res => {
    //   console.log('registerApp: ' + res);
    //   // getApiVersion().then(num => {
    //   //   console.log('test: ' + num);

    //   //   // openWXApp().then()
    //   // });
    // });

    // registerApp('wxfdb7bc274f114f9b', 'com.reactnative.qccq').then(res => {
    //   console.log('registerApp: ' + res);
    //   getApiVersion().then(num => {
    //     console.log('test: ' + num);

    //     // openWXApp().then(() => {

    //     // });
    //     // shareText({
    //     //   text: 'test content.',
    //     //   scene: 0,
    //     // }).then(
    //     //   result => {
    //     //     console.log('result', result);
    //     //   },
    //     //   result => {
    //     //     console.log('result', result);
    //     //   },
    //     // );

    //     shareWebpage({
    //       title: '震惊 这是一条消息！',
    //       description: '这确实是一条消息',
    //       thumbImageUrl: 'http://114.132.187.155:8082/webview/android/11.jpg',
    //       webpageUrl: 'http://114.132.187.155:8082/webview/android/11.jpg',
    //       scene: 0,
    //     });

    //     shareImage({
    //       imageUrl: 'http://114.132.187.155:8082/webview/android/11.jpg',
    //       scene: 0,
    //     }).then(
    //       result => {
    //         console.log('result', result);
    //       },
    //       result => {
    //         console.log('result', result);
    //       },
    //     );
    //   });
    // });
  }, []);

  const onShouldStartLoadWithRequest = event => {
    const {url} = event;
    const isCopyEvent = url.includes('copy:');

    if (isCopyEvent) {
      // 阻止加载新的请求
      return false;
    }

    // 允许加载新的请求
    return true;
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        backgroundColor={'#ffffff00'}
        barStyle="light-content"
        translucent={true}
      />
      <View>
        <Text>My WebView Title</Text>
      </View>

      <Button
        title="Go to Details"
        onPress={async () => {
          // DownloadFile(
          //   'http://219.153.117.192:9999/api/service-obs/auth/FileController/annexDownload?annexId=1676064290722844673&fileName=%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86%E6%B8%85%E5%8D%95%E8%A1%A820230404.xlsx',
          //   'xlsx',
          // );
        }}
      />

      <WebView
        ref={webViewRef}
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
        originWhitelist={['*']}
        javaScriptEnabled={true}
        onNavigationStateChange={handleNavigationStateChange}
        //source={{uri: 'http://114.132.187.155:8082/'}}
        source={
          Platform.OS === 'ios'
            ? require('../../assets/www/index.html')
            : {
                uri: 'file:///android_asset/dist/index.html',
              }
        }
        useWebKit={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        overScrollMode="never" //安卓去除白色拉动动画
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} //禁止复制
        keyboardDisplayRequiresUserAction={false} //隐藏ios键盘完成按钮
        onContentProcessDidTerminate={() => {
          webViewRef.current.reload();
        }}
        // userAgent={
        //   'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        //   // 'Mozilla/5.0 (Mac OS X NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        // }
        onMessage={onMessage}
        style={{flex: 1}}
      />
    </View>
  );
}

export default HomeScreen;
