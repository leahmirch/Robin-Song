import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import colors from '../assets/theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../components/Card';

const ForecastScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title */}
        <Text style={styles.title}>Forecast</Text>

        {/* Bird Preference Button */}
        <View style={styles.preferenceContainer}>
          <View style={styles.preferenceButton}>
            <Text style={styles.preferenceText}>Bird Preference</Text>
          </View>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>American Robin</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.text}
              style={styles.dropdownIcon}
            />
          </View>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Good Morning, Jodi!</Text>
        <Text style={styles.description}>
          You are most likely to see <Text style={styles.highlight}>American Robin</Text> at this location today:
        </Text>

        {/* Location Name */}
        <Text style={styles.locationName}>Hines Park</Text>

        {/* Map */}
        <View style={styles.mapContainer}>
          <Image
            source={require('../assets/img/hines.png')}
            style={styles.mapImage}
          />
        </View>

        {/* Address Box */}
        <Card style={styles.addressContainer}>
          <View style={styles.addressLine}>
            <MaterialCommunityIcons name="map-marker" size={24} color={colors.primary} />
            <Text style={styles.addressLabel}>Address</Text>
          </View>
          <Text style={styles.addressText}>
            7651 N Merriman Rd,{'\n'}Westland, MI 48185
          </Text>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Caprasimo',
    fontSize: 48,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  preferenceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  preferenceButton: {
    backgroundColor: colors.accent,
    borderRadius: 15,
    paddingVertical: 12,
    width: 300,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  preferenceText: {
    fontFamily: 'Caprasimo',
    fontSize: 20,
    color: colors.white,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: 300,
    borderWidth: 2,
    borderColor: `${colors.primary}80`,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontFamily: 'Radio Canada',
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  greeting: {
    fontFamily: 'Caprasimo',
    fontSize: 30,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Radio Canada',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  highlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  locationName: {
    fontFamily: 'Caprasimo',
    fontSize: 48,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  mapContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mapImage: {
    width: 350,
    height: 250,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: colors.primary,
  },
  addressLine: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.identifycard,
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
  },
  addressLabel: {
    fontFamily: 'Caprasimo',
    fontSize: 24,
    color: colors.primary,
  },
  addressText: {
    fontFamily: 'Radio Canada',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginLeft: 10,
  },
});

export default ForecastScreen;
