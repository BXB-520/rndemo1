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
import {RNCamera} from 'react-native-camera';
import {WebView} from 'react-native-webview';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Qrcode from '../qrcode';

function HomeScreen({navigation, route}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const [canGoBack, setcanGoBack] = useState(false);
  const [levl, setlevl] = useState(false);

  useEffect(() => {
    if (route.params?.qrcodeBackData) {
      console.log('route.params?.qrcodeBackData', route.params?.qrcodeBackData);
      webViewRef.current?.postMessage(
        JSON.stringify({qrcodeBackData: route.params?.qrcodeBackData}),
      );
      // Post updated, do something with `route.params.post`
      // For example, send the post to the server
    }
  }, [route.params?.qrcodeBackData]);

  useEffect(() => {
    let backHandlerPressedCount: number = 0;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (backHandlerPressedCount < 1) {
          console.log('canGoBack', canGoBack, webViewRef.current);

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

  // 组件的其他代码

  const webViewRef = useRef(null);

  const handleNavigationStateChange = navState => {
    setcanGoBack(!navState.canGoBack);
  };

  const cameraRef = React.useRef(null);
  const takePicture = async () => {
    setlevl(true);
    navigation.push('Qrcode');
  };

  const handleQRCodeScanned = ({data}) => {
    console.log(data);
    webViewRef.current?.postMessage(data);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar backgroundColor={'#ffffff00'} translucent={true} />
      <View style={styles.header}>
        <Text style={styles.title}>My WebView Title</Text>
      </View>

      <Button
        title="Go to Details"
        onPress={() => {
          setlevl(true);
          navigation.push('Qrcode');
        }}
      />

      {/* <QRCodeScanner
        onRead={handleQRCodeScanned}
        containerStyle={{flex: 1}}
        cameraStyle={{height: 200}}
      /> */}

      {/* <RNCamera
        ref={cameraRef}
        style={{height: 50}}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
      /> */}

      <WebView
        ref={webViewRef}
        originWhitelist={['http://114.132.187.155:8082']}
        onNavigationStateChange={handleNavigationStateChange}
        source={{uri: 'file:///android_asset/www/index.html'}}
        // source={{uri: 'http://114.132.187.155:8082/#/tabs'}}
        allowUniversalAccessFromFileURLs={true}
        onMessage={async (event: any) => {
          const msg = JSON.parse(event.nativeEvent.data);
          switch (msg.type) {
            case 'Qrcode':
              console.log('Qrcode');
              setlevl(true);
              navigation.push('Qrcode');
              break;

            default:
              break;
          }
          // if (msg.type === 'SAVE_IMAGE') {
          //   // save image here
          //   console.log("lail");
          // }
        }}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
      />
      {/* <WebView
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        source={{uri: 'file:///android_asset/www/index.html'}}
        // source={{uri: 'http://114.132.187.155:8082/#/tabs'}}
        onMessage={async (event: any) => {
          const msg = JSON.parse(event.nativeEvent.data);
          switch (msg.type) {
            case 'Qrcode':
              console.log('Qrcode');
              setlevl(true);
              navigation.push('Qrcode');
              break;

            default:
              break;
          }
          // if (msg.type === 'SAVE_IMAGE') {
          //   // save image here
          //   console.log("lail");
          // }
        }}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1}}
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default HomeScreen;
