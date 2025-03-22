import React from 'react';
import { SafeAreaView, Text, StyleSheet, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import colors from '../assets/theme/colors';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.spacing}>
        <Image
          accessible={true}
          accessibilityLabel='Robin Home Screen'
          source={require('../assets/img/logos/robin72.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.text}>Identify birds, one song at a time.</Text>

        <Button
          title="Sign Up"
          onPress={() => navigation.navigate('Register')}
          variant="primary"
          textStyle={{fontSize: 20}}
        />

        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          textStyle={{fontSize: 20}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: colors.background,
  },
  spacing: {
    padding: 24,
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: 16,
  },
  text: {
    fontFamily: 'Radio Canada',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'center',
    width: 250,
    alignSelf: 'center',
    marginBottom: 24,
  },
});