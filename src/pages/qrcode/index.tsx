/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  SafeAreaView,
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

function Qrcode({navigation}: any): JSX.Element {
  const cameraRef = useRef(null);
  const isDarkMode = useColorScheme() === 'dark';

  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    hasCameraPermission();
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }),
    ).start();
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
      params: {qrcodeBackData: data},
      merge: true,
    });
  };

  const onSuccess = e => {
    console.log(e.data);
  };
  return (
    <SafeAreaView style={backgroundStyle}>
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
            colors={['#00000000', '#5698ff']}
            style={styles.containerLine}
          />
        </Animated.View>
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.off}
          cameraStyle={styles.cameraContainer}
          containerStyle={styles.cameraContainer}
        />
      </View>
    </SafeAreaView>
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
    top: 50,
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
    top: 50,
    fontSize: 20,
    color: '#ffffff',
    zIndex: 99,
  },
  titleCenter: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    top: 550,
    fontSize: 17,
    color: '#ffffff',
    zIndex: 99,
  },
  containerBottom: {
    position: 'absolute',
    width: '100%',
    height: 70,
    textAlign: 'center',
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerLine: {
    width: '100%',
    height: 30,
  },
  titleBottom: {
    fontSize: 17,
    color: '#ffffff',
    zIndex: 100,
  },
});

export default Qrcode;
