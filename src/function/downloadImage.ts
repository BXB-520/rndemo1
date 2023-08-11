import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

/**
 * 下载网页图片
 * @param uri  图片地址
 * @returns {*}
 */
export const DownloadImage = (uri: string) => {
  if (!uri) {
    return null;
  }
  return new Promise((resolve, reject) => {
    let timestamp = new Date().getTime(); //获取当前时间错
    let random = String(Math.random() * 1000000); //六位随机数
    let dirs = RNFS.CachesDirectoryPath; //存到缓存
    // Platform.OS === 'ios'
    //   ? RNFS.LibraryDirectoryPath
    //   : RNFS.ExternalDirectoryPath; //外部文件，共享目录的绝对路径（仅限android）
    const downloadDest = `${dirs}/${timestamp + random}.jpg`;
    const formUrl = uri;
    const options = {
      fromUrl: formUrl,
      toFile: downloadDest,
      background: true,
      begin: () => {
        // console.log('begin', res);
        // console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
      },
    };
    try {
      RNFS.downloadFile(options)
        .promise.then(res => {
          console.log(downloadDest);
          CameraRoll.save('file://' + downloadDest, {
            type: 'auto',
            album: 'qccq',
          })
            .then(function (result) {
              console.log('保存成功！地址如下' + result);
            })
            .catch(function (error) {
              console.log('保存失败！', error);
            });
          resolve(res);
        })
        .catch(err => {
          reject(new Error(err));
        });
    } catch (e: any) {
      reject(new Error(e));
    }
  });
};
