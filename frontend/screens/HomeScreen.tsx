import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import colors from '../assets/theme/colors';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontFamily: 'Caprasimo',
    fontSize: 20,
    color: 'black',
  }
});

export default HomeScreen;
