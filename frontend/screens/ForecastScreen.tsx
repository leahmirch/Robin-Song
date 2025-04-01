import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Linking, 
  RefreshControl 
} from 'react-native';
import axios from 'axios';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Accordion from '../components/Accordion';
import PickerComponent from '../components/Picker';
import colors from '../assets/theme/colors';
import { Platform } from 'react-native';
import { API_BASE_URL } from "../../database/firebaseConfig";
import { useUserData } from '../UserContext';

interface HotspotResponse {
  location: string;
  lat: number;
  lon: number;
  reliability_score: number;
}

const ForecastScreen: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('American Robin');
  const [hotspot, setHotspot] = useState<HotspotResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [userWantsLocation, setUserWantsLocation] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const { userData } = useUserData(); 
  const firstName = userData?.firstName || "Guest";

  const birdMapping: Record<string, string> = {
    "American Robin": "robin",
    "Blue Jay": "blue-jays",
    "Turkey Vulture": "turkey-vultures",
    "Canada Goose": "canada-geese",
    "Canvasback": "canvasbacks",
    "Common Grackle": "common-grackles",
    "European Starling": "european-starlings",
    "Mallard": "mallards",
    "Red-winged Blackbird": "redwinged-blackbirds",
    "Ring-billed Gull": "ringbilled-gulls",
    "Tree Swallow": "tree-swallows",
    "American Crow": "american-crows"
  };

  const birdOptions = [
    { label: 'American Robin', value: 'American Robin' },
    { label: 'Blue Jay', value: 'Blue Jay' },
    { label: 'Turkey Vulture', value: 'Turkey Vulture' },
    { label: 'Canada Goose', value: 'Canada Goose' },
    { label: 'Canvasback', value: 'Canvasback' },
    { label: 'Common Grackle', value: 'Common Grackle' },
    { label: 'European Starling', value: 'European Starling' },
    { label: 'Mallard', value: 'Mallard' },
    { label: 'Red-winged Blackbird', value: 'Red-winged Blackbird' },
    { label: 'Ring-billed Gull', value: 'Ring-billed Gull' },
    { label: 'Tree Swallow', value: 'Tree Swallow' },
    { label: 'American Crow', value: 'American Crow'},
  ];

  const currentMonth = new Date().getMonth() + 1;

  const fetchUserPrefs = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/users/me`, {
        credentials: 'include',
      });

      if (!resp.ok) {
        console.error("Failed to fetch user doc in ForecastScreen");
        return;
      }

      const userData = await resp.json();
      const pref = Boolean(userData.locationPreferences);
      setUserWantsLocation(pref);

      if (pref) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setHasPermission(true);
          const location = await Location.getCurrentPositionAsync({});
          setUserCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          setHasPermission(false);
          console.log("User denied OS location permission.");
        }
      } else {
        setHasPermission(false);
        setUserCoords(null);
      }
    } catch (error) {
      console.error("Error in fetchUserPrefs (ForecastScreen):", error);
    }
  };

  const fetchHotspotData = async () => {
    setLoading(true);
    try {
      const params: any = {
        bird: birdMapping[selectedValue],
        month: currentMonth,
      };

      if (userWantsLocation && hasPermission && userCoords) {
        params.lat = userCoords.latitude;
        params.lon = userCoords.longitude;
      }

      const response = await axios.get<HotspotResponse>(`${API_BASE_URL}/get-hotspot`, {
        params,
        withCredentials: true, 
      });
      setHotspot(response.data);
    } catch (error) {
      console.error("API Error:", error);
      setHotspot(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPrefs();
  }, []);

  useEffect(() => {
    fetchHotspotData();
  }, [selectedValue, currentMonth, userWantsLocation, hasPermission, userCoords]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPrefs();
    await fetchHotspotData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.preferenceContainer}>
          <View style={styles.preferenceLabel}>
            <Text accessibilityRole="header" style={styles.preferenceText}>Bird Preference</Text>
          </View>
          <View style={{ width: '100%' }}>
            <Accordion
              accessibilityLabel={`Current bird selection: ${selectedValue}`}
              title={selectedValue} 
              startIcon='bird'
            >
              <PickerComponent
                data={birdOptions}
                value={selectedValue}
                onChange={(itemValue) => setSelectedValue(String(itemValue))}
                showPlaceholder={false}
              />
            </Accordion>
          </View>
        </View>

        <Text style={styles.greeting}>Hello, {firstName}!</Text>
        <Text style={styles.description}>
          You are most likely to see <Text style={styles.highlight}>{selectedValue}</Text> at this location today:
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : hotspot ? (
          <>
            <View
              accessible={true}
              accessibilityRole="summary"
              accessibilityLabel={`${hotspot.location}. Double tap to open an external map for this location.`}
            >
              <Text style={styles.locationName}>{hotspot.location}</Text>
              <MapView
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                initialRegion={{
                  latitude: userCoords?.latitude ?? hotspot?.lat ?? 43.0125,
                  longitude: userCoords?.longitude ?? hotspot?.lon ?? -83.6875,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={() => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hotspot.lat},${hotspot.lon}`;
                  Linking.openURL(mapsUrl);
                }}
              />
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>No data available for this bird at this time.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForecastScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 20,
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
    marginBottom: 12,
    alignItems: 'center',
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
  map: {
      width: '100%',
      height: 320,
      borderRadius: 20,
      marginTop: 10,
    },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 20,
  },
});