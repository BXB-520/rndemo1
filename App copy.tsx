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

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const [canGoBack, setcanGoBack] = useState(false);

  useEffect(() => {
    let backHandlerPressedCount: number = 0;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (backHandlerPressedCount < 1) {
          console.log('canGoBack', canGoBack, webViewRef.current);

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
  }, [canGoBack]);

  // 组件的其他代码

  const webViewRef = useRef(null);

  const handleNavigationStateChange = navState => {
    setcanGoBack(!navState.canGoBack);
  };

  const cameraRef = React.useRef(null);
  const takePicture = async () => {
    const datas = '123';
    webViewRef.current?.postMessage(datas);
    // if (cameraRef.current) {
    //   // const options = {quality: 0.5, base64: true};
    //   // const data = await cameraRef.current.takePictureAsync(options);
    //   // console.log(data);
    //   // const datas = 123;

    // }
  };

  const handleQRCodeScanned = ({data}) => {
    console.log(data);
    webViewRef.current?.postMessage(data);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.header}>
        <Text style={styles.title}>My WebView Title</Text>
      </View>
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
      <Button title="Take Picture" onPress={() => takePicture()} />
      <WebView
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        source={{uri: 'http://114.132.187.155:8082/#/tabs'}}
        onMessage={async (event: any) => {
          console.log(event);
          takePicture();
          // const msg = JSON.parse(event.nativeEvent.data);
          // if (msg.type === 'SAVE_IMAGE') {
          //   // save image here
          //   console.log("lail");
          // }
        }}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{marginTop: 20, flex: 1}}
      />
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

export default App;
