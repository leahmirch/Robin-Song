import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import colors from '../assets/theme/colors';

const OrDivider = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line}/>
      <Text style={styles.text}>or</Text>
      <View style={styles.line}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  line: {
    height: 2,
    backgroundColor: colors.accent,
    width: '47%',
  },
  text: {
    marginHorizontal: 7,
    color: colors.accent,
    fontFamily: 'Radio Canada',
    fontSize: 20,
  }
});

export default OrDivider;
