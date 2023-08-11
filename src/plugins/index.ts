import {SetStateAction} from 'react';
import {NativeModules, Platform, StatusBar} from 'react-native';
import {DownloadImage} from '../function/downloadImage';
import {hasCameraPermission} from '../promise/cameraPromise';
import {ImagePickerResponse, launchCamera} from 'react-native-image-picker';
import {DownloadFile} from '../function/downloadFile';
import {hasPicturePermission} from '../promise/picturePromise';
import {hasFilePermission} from '../promise/filePromise';

/** 打开webview */
const handelWebview = (
  params: {params: {url: any; title: any}},
  setlevl: {(value: SetStateAction<boolean>): void; (arg0: boolean): void},
  navigation: {
    navigate: (arg0: string, arg1: {outUrl: any; outName: any}) => void;
  },
) => {
  setlevl(true);
  navigation.navigate('Webview', {
    outUrl: params.params.url,
    outName: params.params.title,
  });

  return {...params, model: 200, value: true};
};

const {StatusBarManager} = NativeModules;
/** 通知状态栏高度 */
const handelStatusBarHeight = (params: any) => {
  const value = {
    statusBarHeight:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : StatusBarManager.HEIGHT,
  };
  return {...params, model: 200, value: value};
};

/** 打开图片并选择 */
const handelCheckPicture = (
  params: {params: {checkMax: any; showMax: any}},
  setlevl: {(value: SetStateAction<boolean>): void; (arg0: boolean): void},
  navigation: {
    navigate: (arg0: string, arg1: {checkMax: any; showMax: any}) => void;
  },
  nowParams: {current: {params: {checkMax: any; showMax: any}}},
) => {
  setlevl(true);
  navigation.navigate('CheckPicture', {
    checkMax: params.params.checkMax,
    showMax: params.params.showMax,
  });
  nowParams.current = params;
};

/** 清除路由 */
const handelDelHistory = (
  params: any,
  setcanGoBack: (arg0: boolean) => void,
) => {
  setcanGoBack(true);
  return {...params, model: 200, value: true};
};

/** 批量下载图片 */
const handelDownloadImage = async (params: {params: {ImageList: any[]}}) => {
  return new Promise(async resolve => {
    if (await hasPicturePermission()) {
      params.params.ImageList.map((items: string) => {
        const result = DownloadImage(items);
        console.log('result', result);
      });
      resolve({...params, model: 200, value: true});
    } else {
      resolve({...params, model: 200, value: false});
    }
  });
};

/** 批量下载文件 */
const handelDownloadFile = async (params: {
  params: {
    token: string;
    FileList: {url: string; fileType: 'xlsx' | 'pdf' | 'docx'}[];
  };
}) => {
  return new Promise(async resolve => {
    if (await hasFilePermission()) {
      params.params.FileList.map(
        (items: {url: string; fileType: 'xlsx' | 'pdf' | 'docx'}) => {
          const result = DownloadFile(
            items.url,
            params.params.token,
            items.fileType,
          );
          console.log('result', result);
        },
      );
      resolve({...params, model: 200, value: true});
    } else {
      resolve({...params, model: 200, value: false});
    }
  });
};

/** 安卓返回堆栈 */
const HistoryStorage = (
  params: {params: {type: string}},
  historyStorage: {current: any[]},
) => {
  if (params.params.type === 'add') {
    historyStorage.current.push(params);
  } else {
    historyStorage.current.pop();
  }
};

/** 使用相机拍照 */
const handelCameraPlugin = async (params: any) => {
  return new Promise(async resolve => {
    if (await hasCameraPermission()) {
      await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: params.params.maxWidth,
        maxHeight: params.params.maxHeight,
        quality: params.params.quality,
        presentationStyle: 'fullScreen',
      }).then((image: ImagePickerResponse) => {
        const {assets} = image;
        if (assets) {
          resolve({
            ...params,
            model: 200,
            value: {base64: `data:image/png;base64,${assets[0].base64}`},
          });
        } else {
          resolve({...params, model: 200, value: {base64: ''}});
        }
      });
    } else {
      resolve({...params, model: 200, value: {base64: ''}});
    }
  });
};

/** 打开二维码 */
const handelQrcode = (
  params: {params: {checkMax: any; showMax: any}},
  setlevl: {(value: SetStateAction<boolean>): void; (arg0: boolean): void},
  navigation: {navigate: (arg0: string, arg1: {}) => void},
  nowParams: {current: {params: {checkMax: any; showMax: any}}},
) => {
  setlevl(true);
  navigation.navigate('Qrcode', {});
  nowParams.current = params;
};

export {
  handelWebview,
  handelStatusBarHeight,
  handelCheckPicture,
  handelDelHistory,
  handelDownloadImage,
  handelDownloadFile,
  HistoryStorage,
  handelCameraPlugin,
  handelQrcode,
};
