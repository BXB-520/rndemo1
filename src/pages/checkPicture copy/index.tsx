/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Image,
  NativeModules,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Platform} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {hasAndroidPermission} from '../../hooks/picturePromise';
import RNFS from 'react-native-fs';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import ImageResizer from 'react-native-image-resizer';

const {StatusBarManager} = NativeModules;

const maxNumber = 60;

function CheckPicture({navigation, route}: any): JSX.Element {
  const {checkMax, showMax} = route.params;

  const [isResizer, setIsResizer] = useState<boolean>(true);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [checkPhotos, setCheckPhotos] = useState<any[]>([]);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    // backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  /** 页面加载图片 */
  const handelLoad = async () => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      ToastAndroid.show(
        '没有文件权限！请前往应用信息->权限管理->读写手机存储，选择仅在使用中允许！或始终允许！',
        ToastAndroid.LONG,
      );
      navigation.pop();
      return;
    }
    // else if (Platform.OS === 'ios' && !(await hasAndroidPermission())) {
    //   Alert.alert(
    //     '提示',
    //     '没有文件权限！请前往应用信息->权限管理->读写手机存储，选择仅在使用中允许！或始终允许！',
    //   );
    //   navigation.pop();
    //   return;
    // }

    CameraRoll.getPhotos({
      first: showMax ?? maxNumber,
      assetType: 'Photos',
      include: ['imageSize'],
    })
      .then((rusult: {edges: any}) => {
        setAllPhotos(rusult.edges);
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    handelLoad();
    setIsResizer(true);
    setCheckPhotos([]);
  }, []);

  // 读取文件并将其转换为 base64
  const readFileToBase64 = (filePath: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      RNFS.readFile(filePath, 'base64')
        .then(fileContent => {
          resolve(fileContent);
        })
        .catch(error => {
          console.log('读取文件错误:', error);
          reject(null);
        });
    });
  };

  /** 选中照片 */
  const handelAddPhoto = (image: any) => {
    const findPhotoIndex = checkPhotos.findIndex(
      (item: any) => item.file.uri === image.uri,
    );

    if (findPhotoIndex !== -1) {
      const updatedCheckPhotos = [...checkPhotos];
      updatedCheckPhotos.splice(findPhotoIndex, 1);
      setCheckPhotos(
        updatedCheckPhotos.map((item, index) => ({
          ...item,
          id: index.toString(),
        })),
      );
    } else {
      if (checkPhotos.length < checkMax) {
        setCheckPhotos(prevCheckPhotos => {
          const newPhoto = {
            file: image,
            id: prevCheckPhotos.length.toString(),
          };
          const updatedCheckPhotos = [...prevCheckPhotos, newPhoto].map(
            (item, index) => ({
              ...item,
              id: index.toString(),
            }),
          );
          return updatedCheckPhotos;
        });
      } else {
        ToastAndroid.show(`最多选择${checkMax}张图片！`, ToastAndroid.SHORT);
      }
    }
  };

  // const handelSend = () => {
  //   let checkedPhotos: string[] = [];
  //   checkPhotos.map(async (items: any) => {
  //     if (isResizer) {
  //       console.log(items.file.width);

  //       await ImageResizer.createResizedImage(
  //         items.file.uri,
  //         items.file.width / 2,
  //         items.file.height / 2,
  //         'PNG',
  //         50,
  //       )
  //         .then(response => {
  //           readFileToBase64(response.uri)
  //             .then(base64String => {
  //               if (base64String) {
  //                 checkedPhotos.push(`data:image/png;base64,${base64String}`);
  //               }

  //               if (checkedPhotos.length === checkPhotos.length) {
  //                 navigation.navigate({
  //                   name: 'Home',
  //                   params: {pictureList: checkedPhotos},
  //                   merge: true,
  //                 });
  //               }
  //             })
  //             .catch(error => {
  //               console.log('readFileToBase64-转换错误:', error);
  //             });
  //         })
  //         .catch(err => {
  //           console.log('ImageResizer-err:', err);
  //         });
  //     } else {
  //       readFileToBase64(items.file.uri)
  //         .then(base64String => {
  //           if (base64String) {
  //             checkedPhotos.push(`data:image/png;base64,${base64String}`);
  //           }

  //           if (checkedPhotos.length === checkPhotos.length) {
  //             navigation.navigate({
  //               name: 'Home',
  //               params: {pictureList: checkedPhotos},
  //               merge: true,
  //             });
  //           }
  //         })
  //         .catch(error => {
  //           console.log('readFileToBase64-转换错误:', error);
  //         });
  //     }
  //   });
  // };

  const handelSend = async () => {
    let checkedPhotos: string[] = [];

    for (const items of checkPhotos) {
      try {
        if (isResizer) {
          console.log(items.file.uri);

          const response = await ImageResizer.createResizedImage(
            items.file.uri,
            items.file.width / 2,
            items.file.height / 2,
            'PNG',
            1,
          );

          const base64String = await readFileToBase64(response.uri);

          if (base64String) {
            checkedPhotos.push(`data:image/png;base64,${base64String}`);
          }

          if (checkedPhotos.length === checkPhotos.length) {
            navigation.navigate({
              name: 'Home',
              params: {pictureList: checkedPhotos},
              merge: true,
            });
          }
        } else {
          const base64String = await readFileToBase64(items.file.uri);
          if (base64String) {
            checkedPhotos.push(`data:image/png;base64,${base64String}`);
          }

          if (checkedPhotos.length === checkPhotos.length) {
            navigation.navigate({
              name: 'Home',
              params: {pictureList: checkedPhotos},
              merge: true,
            });
          }
        }
      } catch (error) {
        console.log('处理错误:', error);
      }
    }
  };

  return (
    <View style={[backgroundStyle]}>
      <StatusBar
        backgroundColor={'#ffffff00'}
        barStyle="light-content"
        translucent={true}
      />
      <View style={styles.header}>
        <LinearGradient
          colors={['#136fff', '#98c1ff']}
          style={styles.containerLine}
        />
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.pop();
          }}>
          <AntDesign style={styles.close} name="close" size={25} />
        </TouchableWithoutFeedback>
        <Text style={styles.title}>部分项目（{showMax ?? maxNumber}）</Text>
      </View>

      <ScrollView contentContainerStyle={styles.bg}>
        {allPhotos.map((photo: {node: {image: {uri: string}}}, index) => {
          return (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => handelAddPhoto(photo.node.image)}>
              <View style={styles.imgbox}>
                {checkPhotos.findIndex(
                  (item: any) => item.file.uri === photo.node.image.uri,
                ) !== -1 ? (
                  <>
                    <View style={[styles.checkedBox]}>
                      <Text
                        style={{
                          color: '#ffffff',
                        }}>
                        {+checkPhotos.find(
                          (items: any) =>
                            items.file.uri === photo.node.image.uri,
                        )?.id + 1}
                      </Text>
                    </View>
                    <View style={styles.checkedimage} />
                  </>
                ) : (
                  <View style={styles.checkBox} />
                )}
                <Image
                  style={styles.image}
                  source={{uri: photo.node.image.uri}}
                />
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </ScrollView>
      <View style={styles.bottom}>
        <TouchableWithoutFeedback
          onPress={() => {
            setIsResizer(!isResizer);
          }}>
          <View style={styles.bottomText}>
            {isResizer ? (
              <View style={styles.bottomCheck} />
            ) : (
              <View style={styles.bottomChecked}>
                <Feather style={{color: '#ffffff'}} name="check" size={14} />
              </View>
            )}

            <Text style={styles.bottomCheckText}>原图</Text>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.bottomButton}>
          <Button
            disabled={!checkPhotos.length}
            title={`发送${
              checkPhotos.length ? '(' + checkPhotos.length + ')' : ''
            }`}
            onPress={() => handelSend()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: '100%',
    display: 'flex',
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'scroll',
  },
  imgbox: {
    width: '24%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0.5%',
  },
  image: {
    position: 'relative',
    width: '100%',
    height: 100,
  },
  checkedimage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 100,
    zIndex: 99,
    backgroundColor: '#0000004d',
  },
  checkBox: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 22,
    height: 22,
    borderRadius: 50,
    zIndex: 100,
    backgroundColor: '#0000004d',
    borderStyle: 'solid',
    borderWidth: 1.2,
    borderColor: 'white',
  },
  checkedBox: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 22,
    height: 22,
    borderRadius: 50,
    zIndex: 100,
    backgroundColor: '#2196f3',
    borderStyle: 'solid',
    borderWidth: 1.2,
    borderColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBoxText: {
    color: 'white',
    textAlign: 'center',
  },
  header: {
    top: 0,
    height: 80,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'red',
  },
  containerLine: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 100,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    position: 'absolute',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 8,
  },
  close: {
    position: 'absolute',
    top:
      Platform.OS === 'android'
        ? StatusBar.currentHeight! + 8
        : StatusBarManager.HEIGHT + 8,
    right: 10,
    color: '#ffffff',
  },
  bottom: {
    position: 'relative',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 80,
    zIndex: 100,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  bottomText: {
    flex: 3,
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    fontSize: 17,
    marginLeft: 16,
  },
  bottomCheck: {
    marginTop: 2,
    width: 20,
    height: 20,
    borderRadius: 50,
    zIndex: 100,
    borderStyle: 'solid',
    borderWidth: 1.2,
    borderColor: '#9e9e9e',
  },
  bottomChecked: {
    marginTop: 2,
    width: 20,
    height: 20,
    borderRadius: 50,
    zIndex: 100,
    backgroundColor: '#2196f3',
    borderStyle: 'solid',
    borderWidth: 1.2,
    borderColor: '#2196f3',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCheckText: {
    flex: 1,
    fontSize: 17,
    marginLeft: 6,
    color: '#00000090',
  },
  bottomCenterText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    fontSize: 17,
    marginLeft: 12,
  },
  bottomButton: {
    flex: 1,
    marginTop: 12,
    marginRight: 12,
    fontSize: 18,
  },
});

export default CheckPicture;