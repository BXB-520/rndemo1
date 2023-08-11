/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Animated,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {hasCameraPermission} from '../../promise/cameraPromise';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';

const {StatusBarManager} = NativeModules;

function Qrcode({navigation}: any): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const isDarkMode = useColorScheme() === 'dark';

  const [animation] = useState(new Animated.Value(0));

  const startQrcode = async () => {
    if (await hasCameraPermission()) {
      setShow(true);
      Animated.loop(
        Animated.timing(animation, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: false,
        }),
      ).start();
    }
  };

  useEffect(() => {
    startQrcode();
  }, []);

  const top = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10%', '100%'],
  });

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const handleQRCodeScanned = ({data}: any) => {
    navigation.navigate({
      name: 'Home',
      params: {qrcodeData: data},
      merge: true,
    });
  };

  const onSuccess = (e: {data: string}) => {
    console.log(e.data);
    handleQRCodeScanned(e.data);
  };
  return (
    <View style={backgroundStyle}>
      <StatusBar backgroundColor={'#ffffff00'} translucent={true} />
      <View style={styles.container}>
        <View style={styles.backContent}>
          <Text
            style={styles.backIcon}
            onPress={() => {
              navigation.pop();
            }}>
            <AntDesign name="left" size={26} />
          </Text>
        </View>
        <Text style={styles.titleTop}>扫一扫</Text>
        <Text style={styles.titleCenter}>请对准需要扫描的二维码</Text>
        <View style={styles.containerBottom}>
          <Text style={styles.titleBottom}>扫一扫</Text>
        </View>
        <Animated.View style={[styles.bottomGradient, {top}]}>
          <LinearGradient
            colors={['#3678ff00', '#3678ffe6', '#3678ff00']}
            start={{x: 0, y: 1}}
            end={{x: 1, y: 0}}
            style={styles.containerLine}
          />
        </Animated.View>
        {show ? (
          <QRCodeScanner
            onRead={onSuccess}
            flashMode={RNCamera.Constants.FlashMode.off}
            cameraStyle={styles.cameraContainer}
            containerStyle={styles.cameraContainer}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  containerStyle: {
    width: 200,
  },
  cameraStyle: {
    height: '100%',
    width: '100%',
  },
  backContent: {
    position: 'absolute',
    zIndex: 100,
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 10,
    left: 20,
    width: 50,
    right: 50,
  },
  backIcon: {
    position: 'absolute',
    zIndex: 99,
    top: 0,
    left: 0,
    width: 50,
    right: 50,
    color: '#ffffff',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    position: 'relative',
  },
  titleTop: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 10,
    fontSize: 20,
    color: '#ffffff',
    zIndex: 99,
  },
  titleCenter: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    top: 520,
    fontSize: 17,
    color: '#ffffff',
    zIndex: 99,
  },
  containerBottom: {
    position: 'absolute',
    width: '100%',
    height:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 20
        : StatusBarManager.HEIGHT + 30,
    textAlign: 'center',
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerLine: {
    width: '100%',
    height: 6,
    borderRadius: 0,
  },
  titleBottom: {
    fontSize: 18,
    color: '#ffffff',
    zIndex: 100,
    top: 15,
  },
});

export default Qrcode;
