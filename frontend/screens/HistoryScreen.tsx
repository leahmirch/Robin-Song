import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ActivityIndicator} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import SearchBar from "../components/SearchBar";
import colors from "../assets/theme/colors";

// Interface for Firestore data
interface BirdHistory {
  id: string;
  bird: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

const HistoryScreen: React.FC = () => {
  const [birds, setBirds] = useState<BirdHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  useEffect(() => {
    const birdsCollection = collection(db, "birds");
    const q = query(birdsCollection, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const birdData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          bird: data.bird || "Unknown Bird",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });
      setBirds(birdData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Group birds by month
  const groupByMonth = (data: BirdHistory[]) => {
    const grouped: { [key: string]: BirdHistory[] } = {};
    data.forEach((item) => {
      const month = item.timestamp.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(item);
    });
    return grouped;
  };

  const filteredBirds = birds.filter((bird) =>
    bird.bird?.toLowerCase().includes(search.toLowerCase())
  );
  const groupedBirds = groupByMonth(filteredBirds);

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.searchContainer}>
        <SearchBar label='Search...' search={search} setSearch={setSearch} onSearch={handleSearch} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Filter Button */}
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons
            name="filter-variant"
            size={16}
            color={colors.chatGPTCardBackground}
            style={styles.filterIcon}
          />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          Object.entries(groupedBirds).map(([month, birdsInMonth]) => (
            <View key={month} style={styles.monthContainer}>
              {/* Month Header */}
              <Text style={styles.monthHeader}>{month}</Text>
              {/* Bird Entries */}
              {birdsInMonth.map((bird) => (
                <View style={styles.historyCard} key={bird.id}>
                  <Image
                    source={require("../assets/img/robin.png")}
                    style={styles.birdImage}
                  />
                  <View style={styles.entryDetails}>
                    <Text style={styles.birdName}>{bird.bird}</Text>
                    <Text style={styles.birdLocation}>Latitude: {bird.latitude}, Longitude: {bird.longitude}</Text>
                  </View>
                  <View style={styles.entryTime}>
                    <Text style={styles.entryDate}>
                      {bird.timestamp.toLocaleDateString()}
                    </Text>
                    <Text style={styles.entryHour}>
                      {bird.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}

        <Text style={styles.endOfHistory}>End of History.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    marginVertical: 8,
    marginHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Caprasimo",
    fontSize: 48,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    height: 35,
    width: 90,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    marginBottom: 20,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontFamily: "Radio Canada",
    fontSize: 16,
    color: colors.white,
    fontWeight: "bold",
  },
  monthHeader: {
    fontFamily: "Radio Canada",
    fontSize: 24,
    color: colors.secondary,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  birdImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  entryDetails: {
    flex: 1,
  },
  birdName: {
    fontFamily: "Caprasimo",
    fontSize: 18,
    color: colors.primary,
    marginBottom: 2,
  },
  birdLocation: {
    fontFamily: "Radio Canada",
    fontSize: 16,
    color: colors.text,
  },
  entryTime: {
    alignItems: "flex-end",
  },
  entryDate: {
    fontFamily: "Radio Canada",
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "bold",
    marginBottom: 2,
  },
  entryHour: {
    fontFamily: "Radio Canada",
    alignItems: 'flex-end',
    fontSize: 14,
    color: colors.text,
  },
  endOfHistory: {
    fontFamily: "Radio Canada",
    fontSize: 16,
    color: colors.accent,
    textAlign: "center",
    marginVertical: 20,
  },
  monthContainer: {
    marginBottom: 24,
  }
});

export default HistoryScreen;
