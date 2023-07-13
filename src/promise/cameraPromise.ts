import {Platform, ToastAndroid} from 'react-native';
import {PERMISSIONS, request, check} from 'react-native-permissions';

export async function hasCameraPermission() {
  const getCheckPermissionPromise = () => {
    if (Platform.OS === 'android') {
      return check(PERMISSIONS.ANDROID.CAMERA);
    } else {
      return check(PERMISSIONS.IOS.CAMERA);
    }
  };

  const getRequestPermissionPromise = () => {
    if (Platform.OS === 'android') {
      return request(PERMISSIONS.ANDROID.CAMERA);
    } else {
      return request(PERMISSIONS.IOS.CAMERA);
    }
  };

  if ((await getCheckPermissionPromise()) !== 'denied') {
    return true;
  }

  if ((await getRequestPermissionPromise()) !== 'denied') {
    return true;
  }
  if (Platform.OS === 'android') {
    ToastAndroid.show(
      '没有相机权限！请前往应用信息->权限管理->相机，选择仅在使用中允许！或始终允许！',
      ToastAndroid.LONG,
    );
  } else {
  }

  return false;
}
