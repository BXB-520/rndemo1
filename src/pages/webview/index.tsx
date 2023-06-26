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
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  useColorScheme,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {WebView} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';

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
    <SafeAreaView style={backgroundStyle}>
      <StatusBar backgroundColor={'#ffffff00'} translucent={true} />
      <View style={styles.header}>
        <LinearGradient
          colors={['#136fff', '#afecff00']}
          style={styles.containerLine}
        />
        <AntDesign
          onPress={() => {
            if (canGoBack) {
              navigation.pop();
            } else {
              webViewRef.current.goBack();
            }
          }}
          style={styles.back}
          name="left"
          size={23}
        />
        <AntDesign
          onPress={() => {
            navigation.pop();
          }}
          style={styles.close}
          name="close"
          size={25}
        />
        <Text style={styles.title}>{outName}</Text>
      </View>

      <WebView
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        source={{uri: outUrl}}
        allowUniversalAccessFromFileURLs={true}
        // onMessage={async (event: any) => {
        //   const msg = JSON.parse(event.nativeEvent.data);
        //   switch (msg.type) {
        //     case 'Qrcode':
        //       console.log('Qrcode');
        //       setlevl(true);
        //       navigation.push('Qrcode');
        //       break;
        //     case 'Webview':
        //       console.log('Webview');
        //       setlevl(true);
        //       navigation.push('Webview');
        //       break;

        //     default:
        //       break;
        //   }
        // }}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 30,
    height: 74,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  containerLine: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 110,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
  },
  back: {
    position: 'absolute',
    top: 40,
    left: 12,
    color: '#ffffff',
    width: 40,
    height: 40,
  },
  close: {
    position: 'absolute',
    top: 40,
    left: 50,
    color: '#ffffff',
    width: 40,
    height: 40,
  },
});

export default WebViews;
