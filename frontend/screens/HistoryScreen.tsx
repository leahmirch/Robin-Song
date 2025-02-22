import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import colors from "../assets/theme/colors";

const PAGE_SIZE = 20;

interface BirdHistory {
  id: string;
  bird: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

const HistoryScreen: React.FC = () => {
  const [birds, setBirds] = useState<BirdHistory[]>([]);
  const [groupedBirds, setGroupedBirds] = useState<{ [key: string]: BirdHistory[] }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch initial batch of birds
  useEffect(() => {
    fetchBirds(true);
  }, []);

  const fetchBirds = async (reset = false) => {
    if (!hasMore && !reset) return;

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let q = query(
        collection(db, "birds"),
        orderBy("timestamp", "desc"),
        limit(PAGE_SIZE)
      );

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const birdData = snapshot.docs.map((doc) => ({
        id: doc.id,
        bird: doc.data().bird || "Unknown Bird",
        latitude: doc.data().latitude || 0,
        longitude: doc.data().longitude || 0,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      const newBirds = reset ? birdData : [...birds, ...birdData];

      setBirds(newBirds);
      setGroupedBirds(groupByMonth(newBirds));
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching birds:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Group birds by month
  const groupByMonth = (data: BirdHistory[]) => {
    return data.reduce((acc, bird) => {
      const month = bird.timestamp.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(bird);
      return acc;
    }, {} as { [key: string]: BirdHistory[] });
  };

  // Filter birds based on search, species, and date
  const filteredBirds = Object.entries(groupedBirds).reduce((acc, [month, birdsInMonth]) => {
    const filtered = birdsInMonth.filter((bird) => {
      const matchesSearch = bird.bird.toLowerCase().includes(search.toLowerCase());
      const matchesSpecies = selectedSpecies ? bird.bird === selectedSpecies : true;
      const matchesDate = selectedDate ? bird.timestamp.toDateString() === selectedDate.toDateString() : true;
      return matchesSearch && matchesSpecies && matchesDate;
    });

    if (filtered.length > 0) {
      acc[month] = filtered;
    }
    return acc;
  }, {} as { [key: string]: BirdHistory[] });

  // Create data format for FlatList (grouped by month)
  const formattedData = Object.entries(filteredBirds).map(([month, birds]) => ({
    title: month,
    data: birds,
  }));

  const renderItem = ({ item }: { item: { title: string; data: BirdHistory[] } }) => (
    <View style={styles.monthContainer}>
      <Text style={styles.monthHeader}>{item.title}</Text>
      {item.data.map((bird) => (
        <View style={styles.historyCard} key={bird.id}>
          <Image source={require("../assets/img/robin.png")} style={styles.birdImage} />
          <View style={styles.entryDetails}>
            <Text style={styles.birdName}>{bird.bird}</Text>
            <Text style={styles.birdLocation}>Latitude: {bird.latitude}, Longitude: {bird.longitude}</Text>
          </View>
          <View style={styles.entryTime}>
            <Text style={styles.entryDate}>{bird.timestamp.toLocaleDateString()}</Text>
            <Text style={styles.entryHour}>{bird.timestamp.toLocaleTimeString()}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const loadMoreBirds = () => {
    if (!loadingMore && hasMore) {
      fetchBirds();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar label="Search..." search={search} setSearch={setSearch} onSearch={setSearch} />
      </View>

      <Filter
        speciesList={Array.from(new Set(birds.map((b) => ({ label: b.bird, value: b.bird }))))}
        onFilterChange={(type, value) => {
          if (type === "species") setSelectedSpecies(value as string);
          if (type === "date") setSelectedDate(value as Date | null);
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.monthContainer}>
          <FlatList
            data={formattedData}
            keyExtractor={(item) => item.title}
            renderItem={renderItem}
            onEndReached={loadMoreBirds}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          />
        </View>
      )}
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
    marginHorizontal: 10,
  }
});

export default HistoryScreen;
