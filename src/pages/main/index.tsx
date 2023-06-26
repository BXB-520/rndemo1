/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  useColorScheme,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';

function HomeScreen({navigation, route}: any): JSX.Element {
  const webViewRef = useRef<any>(null);

  const [canGoBack, setcanGoBack] = useState(false);
  const [levl, setlevl] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  useEffect(() => {
    if (route.params?.qrcodeBackData) {
      console.log('route.params?.qrcodeBackData', route.params?.qrcodeBackData);
      webViewRef.current?.postMessage(
        JSON.stringify({qrcodeBackData: route.params?.qrcodeBackData}),
      );
    }
  }, [route.params?.qrcodeBackData]);

  /** 控制系统路由返回 */
  useEffect(() => {
    let backHandlerPressedCount: number = 0;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (backHandlerPressedCount < 1) {
          if (canGoBack) {
            if (levl) {
              setlevl(false);
              return false;
            }
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

  const disposeWebMessage = params => {
    console.log(params.modelName);

    switch (params.modelName) {
      case 'Webview':
        Webview(params);
        break;
      default:
        break;
    }
  };

  const Webview = params => {
    const value = true;
    navigation.navigate('Webview', {
      outUrl: params.params.url,
      outName: params.params.title,
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
    console.log(jsString);
    webViewRef.current?.injectJavaScript(jsString);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar backgroundColor={'#ffffff00'} translucent={true} />
      {/* <View style={styles.header}>
        <Text style={styles.title}>My WebView Title</Text>
      </View>

      <Button
        title="Go to Details"
        onPress={() => {
          setlevl(true);
          navigation.push('Qrcode');
        }}
      /> */}

      <WebView
        ref={webViewRef}
        // originWhitelist={['http://114.132.187.155:8082']}
        onNavigationStateChange={handleNavigationStateChange}
        source={{uri: 'file:///android_asset/www/index.html'}}
        // source={{uri: 'http://114.132.187.155:8082/#/tabs'}}
        allowUniversalAccessFromFileURLs={true}
        onMessage={
          onMessage
          //   async (event: any) => {
          //   const msg = JSON.parse(event.nativeEvent.data);
          //   switch (msg?.type) {
          //     case 'Qrcode':
          //       console.log('Qrcode');
          //       setlevl(true);
          //       navigation.push('Qrcode');
          //       break;
          //     case 'Webview':
          //       console.log('Webview');
          //       setlevl(true);
          //       navigation.navigate('Webview', {
          //         outUrl: msg?.data,
          //       });

          //       break;

          //     default:
          //       break;
          //   }
          // }
        }
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
      />
    </SafeAreaView>
  );
}

export default HomeScreen;
