import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

/**
 * 下载文件
 * @param uri 文件地址
 * @param token 文件地址
 * @param type 文件类型 'xlsx' | 'pdf' | 'docx'
 * @returns {*}
 */
export const DownloadFile = (
  uri: string,
  token: string,
  type: 'xlsx' | 'pdf' | 'docx' | 'apk',
  postNewProgess: {(percentage: any): void; (arg0: number): void},
) => {
  if (!uri || !token || !type) {
    return null;
  }
  return new Promise((resolve, reject) => {
    let timestamp = new Date().getTime(); //获取当前时间错
    let random = String(Math.random() * 1000000); //六位随机数
    let dirs =
      Platform.OS === 'ios'
        ? RNFS.LibraryDirectoryPath
        : RNFS.DownloadDirectoryPath; //文件下载
    const downloadDest = `${dirs}/${timestamp + random}.${type}`;
    const formUrl = uri;
    const options = {
      headers: {
        token,
      },
      fromUrl: formUrl,
      toFile: downloadDest,
      background: true,
      begin: () => {
        // console.log('begin', res);
        // console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
      },
      progress: (data: {bytesWritten: number; contentLength: number}) => {
        const progress = data.bytesWritten / data.contentLength;
        const percentage = Math.round(progress * 100);
        // console.log(`Downloaded ${percentage}%`);
        postNewProgess(percentage);
      },
    };
    try {
      RNFS.downloadFile(options)
        .promise.then(res => {
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
