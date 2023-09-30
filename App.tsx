// In App.js in a new project

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/pages/main';
import Qrcode from './src/pages/qrcode';
import WebViews from './src/pages/webview';
import CheckPicture from './src/pages/checkPicture';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false, headerTransparent: true}}
        />
        <Stack.Screen
          name="Qrcode"
          component={Qrcode}
          options={{headerShown: false, headerTransparent: true}}
        />
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
