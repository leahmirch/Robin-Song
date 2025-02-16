import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import axios from "axios";
import colors from "frontend/assets/theme/colors";
import Card from "../components/Card";

interface BirdData {
  bird: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface BirdInfo {
  description: string;
  at_a_glance: string;
  habitat: string;
  image_url: string;
}

const IdentifyScreen: React.FC = () => {
  const [latestBird, setLatestBird] = useState<BirdData | null>(null);
  const [birdImage, setBirdImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("Not Identifying Birds");
  const [birdInfo, setBirdInfo] = useState<BirdInfo | null>(null);

  useEffect(() => {
    // Fetch the latest bird data
    const birdsCollection = collection(db, "birds");
    const q = query(birdsCollection, orderBy("timestamp", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const birdData: BirdData = {
          bird: doc.data().bird,
          latitude: doc.data().latitude,
          longitude: doc.data().longitude,
          timestamp: doc.data().timestamp.toDate(),
        };
        setLatestBird(birdData);

        // Fetch bird info and image
        await fetchBirdInfo(birdData.bird);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBirdInfo = async (birdName: string) => {
    try {
      // Fetch the bird's URL from bird_data.json
      const urlResponse = await axios.get<{ name: string; url: string }>("http://127.0.0.1:5000/bird-info", {
        params: { bird: birdName },
      });
      const birdUrl = urlResponse.data.url;
  
      // Scrape the bird's information from the Audubon page
      const scrapeResponse = await axios.get<{
        description: string;
        at_a_glance: string;
        habitat: string;
        image_url: string;
      }>("http://127.0.0.1:5000/scrape-bird-info", {
        params: { url: birdUrl },
      });
  
      // Debug logs
      console.log("Scrape Response:", scrapeResponse.data);
      console.log("Bird Image URL:", scrapeResponse.data.image_url);
  
      // Set the bird info and image URL
      setBirdInfo(scrapeResponse.data);
      setBirdImage(scrapeResponse.data.image_url);
    } catch (error) {
      console.error("Error fetching bird info:", error);
      setBirdInfo(null);
      setBirdImage(null);
    }
  };

  const toggleDetection = async () => {
    try {
      setIsDetecting((prev) => !prev);
      if (!isDetecting) {
        setDetectionStatus("Identifying Birds");
        // Start detection
        await axios.post("http://127.0.0.1:5000/start-detection");
      } else {
        setDetectionStatus("Not Identifying Birds");
        // Stop detection
        await axios.post("http://127.0.0.1:5000/stop-detection");
      }
    } catch (error) {
      console.error("Error toggling detection:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Status Badges with Central Button */}
        <View style={styles.statusContainer}>
          <Card style={styles.badge}>
            <Text style={styles.badgeDate}></Text>
            <Text style={styles.badgeText}>{detectionStatus}</Text>
            <Text style={styles.badgeDate}></Text>
          </Card>

          <TouchableOpacity
            style={styles.listeningButton}
            onPress={toggleDetection}
          >
            <MaterialCommunityIcons
              name={isDetecting ? "microphone" : "microphone-off"}
              size={36}
              color={colors.card}
            />
          </TouchableOpacity>

          <Card style={styles.badge}>
            <Text style={styles.badgeText}>Bird Last Identified On</Text>
            <Text style={styles.badgeDate}>
              {latestBird
                ? latestBird.timestamp.toLocaleString()
                : "No bird detected yet"}
            </Text>
          </Card>
        </View>

        {/* Species Name */}
        <Text style={styles.speciesName}>
          {latestBird ? latestBird.bird : "American Robin"}
        </Text>
        <Text style={styles.speciesLatin}>
          {latestBird ? "Dynamic Bird Info" : "Turdus Migratorius"}
        </Text>

        {/* Bird Image */}
        <View style={styles.robinContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : birdImage ? (
            <Image source={{ uri: birdImage }} style={styles.robinImage} />
          ) : (
            <Text style={styles.sectionText}>No image available.</Text>
          )}
        </View>

        {/* Description Section */}
        <View>
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.sectionText}>
            {birdInfo?.description || "No description available."}
          </Text>
        </View>
        <View style={styles.separator} />

        {/* At a Glance Section */}
        <View>
          <Text style={styles.sectionHeading}>At a Glance</Text>
          <Text style={styles.sectionText}>
            {birdInfo?.at_a_glance || "No 'At a Glance' information available."}
          </Text>
        </View>
        <View style={styles.separator} />

        {/* Habitat Section */}
        <View>
          <Text style={styles.sectionHeading}>Habitat</Text>
          <Text style={styles.sectionText}>
            {birdInfo?.habitat || "No habitat information available."}
          </Text>
        </View>
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
    fontFamily: "Caprasimo",
    fontSize: 48,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  badge: {
    width: "35%",
    height: 110,
    justifyContent: "center",
    shadowRadius: 0,
    elevation: 3,
    padding: 0,
  },
  badgeText: {
    fontFamily: "Caprasimo",
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
  },
  badgeDate: {
    fontFamily: "Radio Canada",
    fontSize: 12,
    color: colors.text,
    textAlign: "center",
  },
  listeningButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  speciesName: {
    fontFamily: "Caprasimo",
    fontSize: 36,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 5,
  },
  speciesLatin: {
    fontFamily: "Radio Canada Italic",
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  robinContainer: {
    alignItems: "center",
    justifyContent: 'center',
    marginBottom: 20,
  },
  robinImage: {
    width: 350,
    height: 250,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sectionText: {
    fontFamily: "Radio Canada",
    fontSize: 16,
    color: colors.text,
    textAlign: "left",
    lineHeight: 24,
  },
  sectionHeading: {
    fontFamily: "Caprasimo",
    fontSize: 28,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 10,
  },
  separator: {
    height: 2,
    backgroundColor: colors.accent,
    marginVertical: 10,
  },
});

export default IdentifyScreen;