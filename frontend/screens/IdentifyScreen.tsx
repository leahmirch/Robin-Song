import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import axios from "axios";
import colors from "frontend/assets/theme/colors";

// Unsplash API Key
const UNSPLASH_ACCESS_KEY = "OW9_nKN_e_TWvCdmTMB7nuntkSeNR8sSnQzEucwxd-k";

interface BirdData {
  bird: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

const IdentifyScreen: React.FC = () => {
  const [latestBird, setLatestBird] = useState<BirdData | null>(null);
  const [birdImage, setBirdImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false); // State for detection status
  const [detectionStatus, setDetectionStatus] = useState("Identification Stopped");

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

        // Fetch bird image
        await fetchBirdImage(birdData.bird);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBirdImage = async (birdName: string) => {
    setLoading(true);
    try {
      const response = await axios.get<{
        results: { urls: { small: string } }[];
      }>("https://api.unsplash.com/search/photos", {
        params: {
          query: birdName,
          client_id: UNSPLASH_ACCESS_KEY,
          per_page: 1,
        },
      });
      const images = response.data.results;
      setBirdImage(images.length > 0 ? images[0].urls.small : null);
    } catch (error) {
      console.error("Error fetching bird image:", error);
      setBirdImage(null);
    } finally {
      setLoading(false);
    }
  };

    // Toggle detection state and trigger backend
    const toggleDetection = async () => {
      try {
        setIsDetecting((prev) => !prev);
        if (!isDetecting) {
          setDetectionStatus("Identification Active");
          // Start detection
          await axios.post("http://127.0.0.1:5000/start-detection");
        } else {
          setDetectionStatus("Identification Stopped");
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
        {/* Title */}
        <Text style={styles.title}>Identification</Text>

        {/* Status Badges with Central Button */}
        <View style={styles.statusContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeDate}></Text>
            <Text style={styles.badgeText}>{detectionStatus}</Text>
            <Text style={styles.badgeDate}></Text>
          </View>
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Bird Last Identified On</Text>
            <Text style={styles.badgeDate}>
              {latestBird
                ? latestBird.timestamp.toLocaleString()
                : "No bird detected yet"}
            </Text>
          </View>
        </View>

        {/* Species Name */}
        <Text style={styles.speciesName}>
          {latestBird ? latestBird.bird : "American Robin"}
        </Text>
        <Text style={styles.speciesLatin}>
          {latestBird ? "Dynamic Bird Info" : "Turdus Migratorius"}
        </Text>

        {/* Robin Image */}
        <View style={styles.robinContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : birdImage ? (
            <Image source={{ uri: birdImage }} style={styles.robinImage} />
          ) : (
            <Text style={styles.sectionText}>No image available.</Text>
          )}
        </View>

        {/* Sections with Lines */}
        <View>
          <Text style={styles.sectionHeading}>Physical Description</Text>
          <Text style={styles.sectionText}>
            American Robins are fairly large songbirds with a large, round body,
            long legs, and fairly long tail. Robins are the largest North
            American thrushes, and their profile offers a good chance to learn
            the basic shape of most thrushes. Robins make a good reference point
            for comparing the size and shape of other birds, too. American
            Robins are gray-brown birds with warm orange underparts and dark
            heads. In light, a white patch on the lower belly and under the tail
            can be conspicuous. Compared with males, females have paler heads
            that contrast less with the gray back.
          </Text>
        </View>
        <View style={styles.separator} />

        <View>
          <Text style={styles.sectionHeading}>Overview</Text>
          <Text style={styles.sectionText}>
            A very familiar bird over most of North America, running and
            hopping on lawns with upright stance, often nesting on porches and
            windowsills. The Robin's rich caroling is among the earliest bird
            songs heard at dawn in spring and summer, often beginning just
            before first light. In fall and winter, robins may gather by the
            hundreds in roaming flocks, concentrating at sources of food.
          </Text>
        </View>
        <View style={styles.separator} />

        <View>
          <Text style={styles.sectionHeading}>Habitat</Text>
          <Text style={styles.sectionText}>
            Cities, towns, lawns, farmland, forests; in winter, berry-bearing
            trees. Over most of the continent, summers occur wherever there are
            trees for nest sites and mud for nest material. In the arid
            southwest, summers mainly occur in coniferous forests in mountains,
            rarely in well-watered lowland suburbs. In winter, flocks gather in
            wooded areas where trees or shrubs have good crops of berries.
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
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    backgroundColor: colors.identifycard,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
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
    marginBottom: 20,
  },
  robinImage: {
    width: 350,
    height: 250,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: colors.primary,
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
