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
  where,
} from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import SearchBar from "../components/SearchBar";
import colors from "../assets/theme/colors";

const PAGE_SIZE = 20;

interface BirdHistory {
  id: string;
  bird: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface Species {
  label: string;
  value: string;
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

  useEffect(() => {
    fetchBirds(true);
  }, []);

  useEffect(() => {
    fetchBirds(true);
  }, [search, selectedSpecies]);

  const fetchBirds = async (reset = false) => {
    if (!hasMore && !reset) return;

    try {
      reset ? setLoading(true) : setLoadingMore(true);

      let q = query(
        collection(db, "birds"),
        orderBy("timestamp", "desc"),
        limit(PAGE_SIZE)
      );

      if (selectedSpecies) {
        q = query(collection(db, "birds"), where("bird", "==", selectedSpecies), orderBy("timestamp", "desc"), limit(PAGE_SIZE));
      }

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      let birdData = snapshot.docs.map((doc) => ({
        id: doc.id,
        bird: doc.data().bird || "Unknown Bird",
        latitude: doc.data().latitude || 0,
        longitude: doc.data().longitude || 0,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      if (search) {
        birdData = birdData.filter(bird => bird.bird.toLowerCase().includes(search.toLowerCase()));
      }

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

  const handleFilterChange = (type: string, value: string | null) => {
    if (type === "species") {
      setSelectedSpecies(value as string);
    }
  };

  const formattedData = Object.entries(groupedBirds).map(([month, birds]) => ({
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
      <View style={styles.topBar}>
          <SearchBar label="Search..."
            search={search}
            setSearch={(value) => {
              setSearch(value);
              if (value === "") {
                fetchBirds(true);
              }
            }}
            onSearch={setSearch} 
          />
      </View>

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
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : !hasMore ? ( 
                <Text style={styles.endOfHistory}>End of History.</Text>
              ) : null
            }
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={5}
            getItemLayout={(data, index) => ({
              length: 100,
              offset: 100 * index,
              index
            })}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    marginVertical: 8,
    marginHorizontal: 15,
    alignItems: 'center',
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
    elevation: 3,
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
    marginBottom: 60,
  },
  monthContainer: {
    marginBottom: 24,
    marginHorizontal: 10,
  }
});
