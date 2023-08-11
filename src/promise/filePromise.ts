import {Alert, Platform, ToastAndroid} from 'react-native';
import {PERMISSIONS, check, request} from 'react-native-permissions';

export async function hasFilePermission() {
  const getCheckPermissionPromise = () => {
    if (Platform.OS === 'android') {
      return check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    } else {
      return check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };

  const getRequestPermissionPromise = () => {
    if (Platform.OS === 'android') {
      return request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    } else {
      return request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };

  const haspermission = await getCheckPermissionPromise();
  if (haspermission !== 'blocked' && haspermission !== 'denied') {
    return true;
  }

  const requestpermission = await getRequestPermissionPromise();
  if (requestpermission !== 'blocked' && requestpermission !== 'denied') {
    return true;
  }
  if (Platform.OS === 'android') {
    ToastAndroid.show(
      '没有文件权限！请前往应用信息->权限管理->读写手机存储，选择仅在使用中允许！或始终允许！',
      ToastAndroid.LONG,
    );
  } else {
    Alert.alert(
      '提示',
      '没有照片权限！请前往隐私与安全性->文件，打开文件权限！',
      [{text: '知道了', onPress: () => {}}],
    );
  }

  return false;
}
