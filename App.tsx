// In App.js in a new project

import * as React from 'react';
import {View, Text, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/pages/main';
import Qrcode from './src/pages/qrcode';
import WebViews from './src/pages/webview';
import Camera from './src/pages/camera';
import CheckPicture from './src/pages/checkPicture';

// function HomeScreen({navigation}) {
//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <Text>Home Screen</Text>
//       <Button
//         title="Go to Details"
//         onPress={() => navigation.push('Details')}
//       />
//     </View>
//   );
// }

function DetailsScreen({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Details Screen</Text>
      <Button
        title="back to home"
        onPress={() => {
          // navigation.goBack();
          console.log('navigation', navigation.state);

          navigation.navigate({
            name: 'Home',
            params: {url: '1234'},
            merge: true,
          });
        }}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        {/* <Stack.Screen
          name="Qrcode"
          component={Qrcode}
          options={{headerShown: false, headerTransparent: true}}
        /> */}

        <Stack.Screen
          name="CheckPicture"
          component={CheckPicture}
          options={{headerShown: false, headerTransparent: true}}
        />
        <Stack.Screen
          name="Webview"
          component={WebViews}
          options={{headerShown: false, headerTransparent: true}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
