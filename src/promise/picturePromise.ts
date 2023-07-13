import {Platform, ToastAndroid} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PERMISSIONS, check, request} from 'react-native-permissions';

export async function hasPicturePermission() {
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

  if ((await getCheckPermissionPromise()) !== 'denied') {
    return true;
  }

  if ((await getRequestPermissionPromise()) !== 'denied') {
    return true;
  }
  if (Platform.OS === 'android') {
    ToastAndroid.show(
      '没有文件权限！请前往应用信息->权限管理->读写手机存储，选择仅在使用中允许！或始终允许！',
      ToastAndroid.LONG,
    );
  } else {
  }

  return false;
}

export async function savePicture(url: string) {
  if (await hasPicturePermission()) {
    CameraRoll.save(url);
  }
}
