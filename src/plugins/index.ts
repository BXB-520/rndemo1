import {SetStateAction} from 'react';
import {NativeModules, Platform, StatusBar} from 'react-native';
import {DownloadImage} from '../function/downloadImage';
import {hasCameraPermission} from '../promise/cameraPromise';
import {ImagePickerResponse, launchCamera} from 'react-native-image-picker';
import {DownloadFile} from '../function/downloadFile';
import {hasPicturePermission} from '../promise/picturePromise';
import {hasFilePermission} from '../promise/filePromise';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import {
  getApiVersion,
  registerApp,
  shareWebpage,
} from 'react-native-wechat-lib';
import {WX_KEY, ANDROID_ID} from '../constants';

/** 打开webview */
const handelWebview = (
  params: {params: {url: any; title: any}},
  setlevl: {(value: SetStateAction<boolean>): void; (arg0: boolean): void},
  navigation: {
    navigate: (arg0: string, arg1: {outUrl: any; outName: any}) => void;
  },
  nowParams: {current: {params: {url: any; title: any}}},
) => {
  setlevl(true);
  navigation.navigate('Webview', {
    outUrl: params.params.url,
    outName: params.params.title,
  });

  nowParams.current = params;
  return {...params, value: true};
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
  return {...params, value: value};
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
  return {...params, value: true};
};

/** 清除路由 */
const handelDelHistory = (
  params: any,
  setcanGoBack: (arg0: boolean) => void,
) => {
  setcanGoBack(true);
  return {...params, value: true};
};

/** 批量下载图片 */
const handelDownloadImage = async (
  params: {params: {ImageList: any[]}},
  postMessageToWeb: Function,
) => {
  return new Promise(async resolve => {
    if (await hasPicturePermission()) {
      postMessageToWeb({...params, value: true});
      params.params.ImageList.map((items: string) => {
        const result = DownloadImage(items);
        console.log('result', result);
      });
      resolve({...params, status: '2', value: true});
    } else {
      resolve({...params, status: '0', value: false});
    }
  });
};

/** 批量下载文件 */
const handelDownloadFile = async (
  params: {
    params: {
      token: string;
      FileList: {url: string; fileType: 'xlsx' | 'pdf' | 'docx' | 'apk'};
    };
  },
  postMessageToWeb: Function,
) => {
  return new Promise(async resolve => {
    if (await hasFilePermission()) {
      postMessageToWeb({...params, value: true});
      const {FileList, token} = params.params;

      let limit = 0;
      /** 进度下载发送 */
      const postNewProgess = (percentage: any) => {
        if (percentage >= limit) {
          limit = limit + 10;
          postMessageToWeb({...params, status: '2', value: percentage});
        }
      };

      await DownloadFile(
        FileList.url,
        token,
        FileList.fileType,
        postNewProgess,
      );
      resolve({...params, status: '2', value: 100});
    } else {
      resolve({...params, status: '0', value: false});
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
  return {...params, value: true};
};

/** 使用相机拍照 */
const handelCameraPlugin = async (params: any, postMessageToWeb: Function) => {
  return new Promise(async resolve => {
    if (await hasCameraPermission()) {
      postMessageToWeb({...params, value: true});
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
            status: '2',
            value: {base64: `data:image/png;base64,${assets[0].base64}`},
          });
        } else {
          resolve({...params, status: '2', value: {base64: ''}});
        }
      });
    } else {
      resolve({...params, status: '0', value: '没有相机权限'});
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
  return {...params, value: true};
};

/** 使用NFC */
const handeluseNfc = async (
  params: {params: {type: 'open' | 'close'}},
  postMessageToWeb: Function,
) => {
  return new Promise(async resolve => {
    postMessageToWeb({...params, value: true});

    if (params.params.type === 'open') {
      NfcManager.start();
      try {
        // register for the NFC tag with NDEF in it
        await NfcManager.requestTechnology(NfcTech.Ndef);
        // the resolved tag object will contain `ndefMessage` property
        const tag = await NfcManager.getTag();
        console.log('Tag found', tag);
        resolve({...params, status: '2', value: {tag}});
      } catch {
        console.log('useNfc-Error');
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    } else {
      NfcManager.cancelTechnologyRequest();
      resolve({...params, status: '2', value: {tag: {}}});
    }
  });
};

/** 微信分享 */
const handleOpenWxShare = (params: {
  params: {
    title: string;
    description: string;
    thumbImageUrl: string;
    webpageUrl: string;
  };
}) => {
  return new Promise(async resolve => {
    const {title, description, thumbImageUrl, webpageUrl} = params.params;
    registerApp(WX_KEY, ANDROID_ID).then(async res => {
      console.log('registerApp: ' + res);
      if (res) {
        getApiVersion().then(num => {
          console.log('test: ' + num);
          if (num) {
            shareWebpage({
              title,
              description,
              thumbImageUrl,
              webpageUrl,
              scene: 0,
            });
            resolve({...params, value: true});
          } else {
            resolve({...params, status: '0', value: '未安装微信App'});
          }
        });
      } else {
        resolve({...params, status: '0', value: '微信sdk错误'});
      }
    });
  });
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
  handeluseNfc,
  handleOpenWxShare,
};
