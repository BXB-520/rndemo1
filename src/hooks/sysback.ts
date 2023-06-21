import {useEffect} from 'react';
import {BackHandler, ToastAndroid} from 'react-native';

export const MyComponent = () => {
  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     () => {
  //       if (backHandlerPressedCount < 1) {
  //         backHandlerPressedCount++;
  //         ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
  //         setTimeout(() => {
  //           backHandlerPressedCount = 0;
  //         }, 2000);
  //         return true;
  //       } else {
  //         backHandlerPressedCount = 0;
  //         BackHandler.exitApp();
  //         return false;
  //       }
  //     },
  //   );
  //   return () => backHandler.remove();
  // }, []);
  // let backHandlerPressedCount = 0;
  // 组件的其他代码
};
