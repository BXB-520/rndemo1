/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {WebView} from 'react-native-webview';

const {StatusBarManager} = NativeModules;

function WebViews({navigation, route}: any): JSX.Element {
  const {outUrl, outName} = route.params;

  const webViewRef = useRef<any>(null);

  const [canGoBack, setcanGoBack] = useState(false);
  const [levl, setlevl] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack) {
          if (levl) {
            setlevl(false);
            return false;
          }
          handleCloseWebview();
          return true;
        } else {
          webViewRef.current.goBack();
          return true;
        }
      },
    );

    return () => backHandler.remove();
  }, [canGoBack, levl]);

  // 组件的其他代码

  const handleNavigationStateChange = (navState: {canGoBack: boolean}) => {
    setcanGoBack(!navState.canGoBack);
  };

  /** 关闭WebViewchufa */
  const handleCloseWebview = () => {
    navigation.navigate({
      name: 'Home',
      params: {webView: {status: 'close'}},
      merge: true,
    });
  };

  return (
    <View style={styles.backgroundStyle}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <LinearGradient
          colors={['#136fff', '#98c1ff']}
          style={styles.containerLine}
        />
        <TouchableWithoutFeedback
          onPress={() => {
            if (canGoBack) {
              handleCloseWebview();
            } else {
              webViewRef.current.goBack();
            }
          }}>
          <View style={styles.back}>
            <AntDesign name="left" color={'#ffffff'} size={25} />
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            handleCloseWebview();
          }}>
          <View style={styles.close}>
            <AntDesign name="close" color={'#ffffff'} size={25} />
          </View>
        </TouchableWithoutFeedback>

        <Text style={styles.title}>{outName}</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.webview}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          onNavigationStateChange={handleNavigationStateChange}
          source={{uri: outUrl}}
          useWebKit={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          onContentProcessDidTerminate={() => {
            webViewRef.current.reload();
          }}
          style={styles.webview}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  header: {
    height:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 46
        : StatusBarManager.HEIGHT + 46,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  containerLine: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 100,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    position: 'absolute',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 10,
  },
  back: {
    position: 'absolute',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 10,
    left: 12,
    width: 25,
    height: 25,
  },
  close: {
    position: 'absolute',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 10,
    left: 50,
    width: 25,
    height: 25,
  },
  webview: {
    flex: 1,
  },
});

export default WebViews;
