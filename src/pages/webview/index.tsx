/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {WebView} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const {StatusBarManager} = NativeModules;

function WebViews({navigation, route}: any): JSX.Element {
  const {outUrl, outName} = route.params;

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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack) {
          if (levl) {
            setlevl(false);
            return false;
          }
          navigation.pop();
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

  return (
    <View style={backgroundStyle}>
      <StatusBar
        backgroundColor={'#ffffff00'}
        barStyle="light-content"
        translucent={true}
      />
      <View style={styles.header}>
        <LinearGradient
          colors={['#136fff', '#98c1ff']}
          style={styles.containerLine}
        />
        <TouchableWithoutFeedback
          onPress={() => {
            if (canGoBack) {
              navigation.pop();
            } else {
              webViewRef.current.goBack();
            }
          }}>
          <AntDesign style={styles.back} name="left" size={23} />
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            navigation.pop();
          }}>
          <AntDesign style={styles.close} name="close" size={25} />
        </TouchableWithoutFeedback>

        <Text style={styles.title}>{outName}</Text>
      </View>

      <WebView
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        source={{uri: outUrl}}
        allowUniversalAccessFromFileURLs={true}
        style={{flex: 1}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : StatusBarManager.HEIGHT,
    height: 80,
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
        : StatusBarManager.HEIGHT + 8,
  },
  back: {
    position: 'absolute',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 8,
    left: 12,
    color: '#ffffff',
  },
  close: {
    position: 'absolute',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 8,
    left: 50,
    color: '#ffffff',
  },
});

export default WebViews;
