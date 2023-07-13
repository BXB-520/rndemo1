import { SetStateAction } from 'react';
import { NativeModules, Platform, StatusBar } from 'react-native';
import { DownloadImage } from '../hooks/downloadPicture';
import { hasCameraPermission } from '../promise/cameraPromise';
import { ImagePickerResponse, launchCamera } from 'react-native-image-picker';

/** 打开webview */
export const handelWebview = (
  params: { params: { url: any; title: any } },
  setlevl: { (value: SetStateAction<boolean>): void; (arg0: boolean): void },
  navigation: {
    navigate: (arg0: string, arg1: { outUrl: any; outName: any }) => void;
  },
) => {
  setlevl(true);
  navigation.navigate('Webview', {
    outUrl: params.params.url,
    outName: params.params.title,
  });

  return { ...params, model: 200, value: true };
};

const { StatusBarManager } = NativeModules;
/** 通知状态栏高度 */
export const handelStatusBarHeight = (params: any) => {
  const value = {
    statusBarHeight:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : StatusBarManager.HEIGHT,
  };
  return { ...params, model: 200, value: value };
};

/** 打开图片并选择 */
export const handelCheckPicture = (
  params: { params: { checkMax: any; showMax: any } },
  setlevl: { (value: SetStateAction<boolean>): void; (arg0: boolean): void },
  navigation: {
    navigate: (arg0: string, arg1: { checkMax: any; showMax: any }) => void;
  },
  nowParams: { current: { params: { checkMax: any; showMax: any } } },
) => {
  setlevl(true);
  navigation.navigate('CheckPicture', {
    checkMax: params.params.checkMax,
    showMax: params.params.showMax,
  });
  nowParams.current = params;
};

/** 清除路由 */
export const handelDelHistory = (
  params: any,
  setcanGoBack: (arg0: boolean) => void,
) => {
  setcanGoBack(true);
  return { ...params, model: 200, value: true };
};

/** 批量下载图片 */
export const handelDownloadImage = (params: { params: { ImageList: any[] } }) => {
  params.params.ImageList.map((items: string) => {
    const result = DownloadImage(items);
    console.log('result', result);
  });
  return { ...params, model: 200, value: true };
};

/** 安卓返回堆栈 */
export const HistoryStorage = (
  params: { params: { type: string } },
  historyStorage: { current: any[] },
) => {
  if (params.params.type === 'add') {
    historyStorage.current.push(params);
  } else {
    historyStorage.current.pop();
  }
};

/** 使用相机拍照 */
export const cameraPlugin = async (params: any) => {
  return new Promise(async resolve => {
    if (await hasCameraPermission()) {
      await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: params.params.maxWidth,
        maxHeight: params.params.maxHeight,
        quality: params.params.quality,
        presentationStyle: "fullScreen",
      }).then((image: ImagePickerResponse) => {
        const { assets } = image;
        if (assets) {
          resolve({
            ...params,
            model: 200,
            value: { base64: `data:image/png;base64,${assets[0].base64}` },
          });
        } else {
          resolve({ ...params, model: 200, value: { base64: '' } });
        }
      });
    } else {
      resolve({ ...params, model: 200, value: { base64: '' } });
    }
  });
};
