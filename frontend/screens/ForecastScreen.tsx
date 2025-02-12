import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import colors from '../assets/theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../components/Card';
import DropdownComponent from '../components/Dropdown';

const ForecastScreen: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string | number | null>('American Robin');

  const data = [
    { label: 'American Robin', value: 'American Robin' },
    { label: 'Blue Jay', value: 'Blue Jay' },
    { label: 'Hawk', value: 'Hawk' },
    { label: 'Goose', value: 'Goose' },
    { label: 'Duck', value: 'Duck' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.preferenceContainer}>
          <View style={styles.preferenceLabel}>
            <Text style={styles.preferenceText}>Bird Preference</Text>
          </View>
          <DropdownComponent
            data={data}
            value={selectedValue}
            onChange={(item) => setSelectedValue(item.value)}
            placeholder="Select a species"
          />
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Good Morning, Jodi!</Text>
        <Text style={styles.description}>
          You are most likely to see <Text style={styles.highlight}>{selectedValue}</Text> at this location today:
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
            <MaterialCommunityIcons name="map-marker-radius-outline" size={24} color={colors.primary} />
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
    padding: 20,
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
    marginBottom: 16,
  },
  preferenceLabel: {
    width: '100%',
    height: 50,
    backgroundColor: colors.accent,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
  },
  preferenceText: {
    fontFamily: 'Caprasimo',
    fontSize: 20,
    color: colors.white,
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
    marginBottom: 8,
  },
  highlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  locationName: {
    fontFamily: 'Caprasimo',
    fontSize: 40,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 12,
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
    marginLeft: 4,
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
