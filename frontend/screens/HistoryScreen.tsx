import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image, ActivityIndicator} from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
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
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const handleFilterChange = (filterType: string, filterValue: string | { start?: Date; end?: Date } | null) => {
    if (filterType === "species") {
      setSelectedSpecies(filterValue as string);
    } else if (filterType === "date") {
      if (typeof filterValue === "object" && filterValue !== null) {
        if (filterValue.start) {
          setSelectedDate(filterValue.start);
        }
      } else {
        setSelectedDate(filterValue as Date | null);
      }
    }
  };

  const filteredBirds = birds.filter((bird) => {
    const matchesSearch = bird.bird.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies = selectedSpecies ? bird.bird === selectedSpecies : true;
    const matchesDate = selectedDate
      ? bird.timestamp.toDateString() === selectedDate.toDateString()
      : true;

    return matchesSearch && matchesSpecies && matchesDate;
  });

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

  const groupedBirds = groupByMonth(filteredBirds);

  const uniqueSpeciesList = Array.from(new Set(birds.map((b) => b.bird)))
  .map((species) => ({ label: species, value: species }))
  .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.searchContainer}>
        <SearchBar label='Search...' search={search} setSearch={setSearch} onSearch={handleSearch} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <Filter
          speciesList={uniqueSpeciesList}
          onFilterChange={handleFilterChange}
        />

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
