/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  NativeModules,
  StatusBar,
  ToastAndroid,
  View,
  useColorScheme,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Platform} from 'react-native';
import {DownloadImage} from '../../hooks/downloadPicture';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

const {StatusBarManager} = NativeModules;

function HomeScreen({navigation, route}: any): JSX.Element {
  const webViewRef = useRef<any>(null);

  const nowParams = useRef<any>(null);

  const [canGoBack, setcanGoBack] = useState(false);
  const [levl, setlevl] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  function openImageLibrary() {
    launchImageLibrary(
      {mediaType: 'photo', includeBase64: true, selectionLimit: 5},
      e => {
        console.log(e);
      },
    );
    // ImagePicker.openPicker({
    //   multiple: true,
    // }).then(images => {
    //   console.log(images);
    // });
    // ImagePicker.openPicker({
    //   width: 300,
    //   height: 400,
    //   multiple: true,
    // }).then(image => {
    //   console.log(image);
    // });
    // You can also use as a promise without 'callback':
    // const result = await launchImageLibrary(options?);
  }

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
    // openImageLibrary();
    console.log('getbackdata', route.params?.pictureList);

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

  const disposeWebMessage = (params: any) => {
    console.log(params.modelName);
    switch (params.modelName) {
      case 'Webview':
        handelWebview(params);
        break;
      case 'StatusBarHeight':
        handelStatusBarHeight(params);
        break;
      case 'CheckPicture':
        handelCheckPicture(params);
        break;
      case 'DelHistory':
        handelDelHistory(params);
        break;
      case 'DownloadImage':
        handelDownloadImage(params);
        break;

      default:
        break;
    }
  };

  /** 打开webview */
  const handelWebview = (params: any) => {
    const value = true;
    setlevl(true);
    navigation.navigate('Webview', {
      outUrl: params.params.url,
      outName: params.params.title,
    });
    postMessageToWeb({...params, model: 200}, value);
  };
  /** 通知状态栏高度 */
  const handelStatusBarHeight = (params: any) => {
    const value = {
      statusBarHeight:
        Platform.OS === 'android'
          ? StatusBar.currentHeight
          : StatusBarManager.HEIGHT - 10,
    };
    postMessageToWeb({...params, model: 200}, value);
  };
  /** 打开图片并选择 */
  const handelCheckPicture = (params: any) => {
    setlevl(true);
    navigation.navigate('CheckPicture', {
      checkMax: params.params.checkMax,
      showMax: params.params.showMax,
    });
    nowParams.current = params;
  };
  /** 清除路由 */
  const handelDelHistory = (params: any) => {
    const value = true;
    setcanGoBack(true);
    postMessageToWeb({...params, model: 200}, value);
  };
  /** 批量下载图片 */
  const handelDownloadImage = (params: any) => {
    const value = true;
    params.params.ImageList.map((items: any) => {
      const result = DownloadImage(items);
      console.log('result', result);
    });
    postMessageToWeb({...params, model: 200}, value);
  };

  /**
   * 封装了webview进行函数回调的方式
   * params   H5调用时候的参数，包含了functionId和modelName
   * value	需要返回的value对象
   */
  const postMessageToWeb = (params, value) => {
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
      {/* <View>
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
          // setlevl(true);
          // navigation.navigate('CheckPicture', {});

          DownloadImage('http://114.132.187.155:8082/webview/android/11.jpg');
        }}
      /> */}

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        onNavigationStateChange={handleNavigationStateChange}
        //source={{uri: 'http://114.132.187.155:8082/'}}
        source={{uri: 'http://219.153.117.192:10001'}}
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
        // userAgent={
        //   'Mozilla/5.0 (Mac OS X NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        // }
        // applicationNameForUserAgent={'DemoApp/1.1.0'}
        onMessage={onMessage}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
      />
    </View>
  );
}

export default HomeScreen;
