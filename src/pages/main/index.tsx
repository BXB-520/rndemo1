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
  StatusBar,
  Text,
  ToastAndroid,
  View,
  useColorScheme,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ImagePickerResponse, launchCamera} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {hasCameraPermission} from '../../promise/cameraPromise';
import {
  handelWebview,
  handelStatusBarHeight,
  handelCheckPicture,
  handelDelHistory,
  handelDownloadImage,
  HistoryStorage,
  cameraPlugin,
} from '../../plugins/index';

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

  useEffect(() => {
    if (route.params?.pictureList) {
      handelPostPics(route.params?.pictureList);
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
        const resultWebview = handelWebview(params, setlevl, navigation);
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
        const resultDownloadImage = handelDownloadImage(params);
        postMessageToWeb(resultDownloadImage, resultDownloadImage.value);
        break;
      case 'HistoryStorage':
        HistoryStorage(params, historyStorage);
        break;
      case 'useCamera':
        const resultCamera: any = await cameraPlugin(params);
        postMessageToWeb(resultCamera, resultCamera.value);
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
      value?: boolean;
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
    // console.log(jsString);
    webViewRef.current?.injectJavaScript(jsString);
    nowParams.current = null;
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
      <View>
        <Text>My WebView Title</Text>
      </View>
      <View>
        <Text>My WebView Title</Text>
      </View>

      <Button
        title="Go to Details"
        onPress={async () => {
          setlevl(true);
          navigation.navigate('Qrcode', {});
          //webViewRef.current.reload();
          // if (await hasCameraPermission()) {
          //   launchCamera({
          //     mediaType: 'photo',
          //     includeBase64: true,
          //     maxWidth: 2,
          //     maxHeight: 1,
          //     quality: 1,
          //   }).then((image: ImagePickerResponse) => {
          //     console.log(image);
          //     const {assets} = image;
          //     if (assets) {
          //       console.log(assets[0].base64);
          //     }
          //   });
          // }
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
        source={{uri: 'http://219.153.117.192:10001/tabs'}}
        // source={
        //   Platform.OS === 'ios'
        //     ? require('../../assets/www/index.html')
        //     : {
        //         uri: 'file:///android_asset/www/index.html',
        //       }
        // }
        useWebKit={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        onContentProcessDidTerminate={() => {
          webViewRef.current.reload();
        }}
        // userAgent={
        //   'Mozilla/5.0 (Mac OS X NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        // }
        // applicationNameForUserAgent={'DemoApp/1.1.0'}
        onMessage={onMessage}
        style={{flex: 1}}
      />
    </View>
  );
}

export default HomeScreen;
