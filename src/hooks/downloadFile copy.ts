export const handelSend = async (checkPhotos, isResizer) => {
  let checkedPhotos: string[] = [];

  for (const items of checkPhotos) {
    try {
      if (isResizer) {
        console.log(items.file.uri);
        console.log('1111');

        const response = await ImageResizer.createResizedImage(
          items.file.uri,
          items.file.width / 2,
          items.file.height / 2,
          'PNG',
          60,
          0,
          RNFS.DocumentDirectoryPath,
        );
        console.log('2222');
        const base64String = await readFileToBase64(response.uri);
        console.log('33333');
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
      console.log('2222');
      const base64String = await readFileToBase64(items.file.uri);
      if (base64String) {
        checkedPhotos.push(`data:image/png;base64,${base64String}`);
      }


      console.log('33333');
      if (checkedPhotos.length === checkPhotos.length) {
        navigation.navigate({
          name: 'Home',
          params: {pictureList: checkedPhotos},
          merge: true,
        });
      }
      // }
    } catch (error) {
      console.log('处理错误:', error);
    }
  }
};