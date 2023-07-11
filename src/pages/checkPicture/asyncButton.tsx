/* eslint-disable react-native/no-inline-styles */
import React, {FC, useRef, useState} from 'react';
import {
  View,
  Animated,
  Easing,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const AsyncButton: FC<{
  disabled: boolean;
  title: string;
  onPress: Function;
}> = ({disabled, title, onPress}) => {
  const [rotation] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const loading = useRef<boolean>(false);

  const startRotation = () => {
    const animation = Animated.timing(rotation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    if (loading.current) {
      animation.start(() => {
        rotation.setValue(0);
        startRotation();
      });
    } else {
      animation.stop();
    }
  };

  const handelSend = async () => {
    if (disabled || loading.current) {
      return;
    }
    setIsLoading(true);
    loading.current = true;
    startRotation();
    await onPress();
    setIsLoading(false);
    loading.current = false;
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableWithoutFeedback onPress={handelSend}>
      <View
        style={[
          styles.bg,
          {backgroundColor: disabled ? '#c2c2c2' : '#579dfc'},
        ]}>
        <View>
          <Text style={styles.Text}>{title}</Text>
        </View>
        <View style={{marginLeft: isLoading ? 4 : 0}}>
          <Animated.View style={{transform: [{rotate: spin}]}}>
            {isLoading ? (
              <AntDesign style={styles.round} name="loading1" size={16} />
            ) : null}
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AsyncButton;

const styles = StyleSheet.create({
  bg: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 2,
  },
  Text: {
    color: '#ffffff',
    fontWeight: '500',
  },
  spin: {
    marginLeft: 8,
  },
  round: {
    color: '#ffffff',
  },
});
