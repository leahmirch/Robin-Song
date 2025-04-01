import React, { useState, useEffect, useCallback, useMemo } from "react";
import {SafeAreaView, View,Text, StyleSheet, Image, ActivityIndicator, SectionList,TouchableOpacity,Alert, Linking, RefreshControl} from "react-native";
import {collection, query, orderBy,limit, startAfter, getDocs, where} from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import colors from "../assets/theme/colors";
import axios from "axios";
import debounce from "lodash.debounce";
import Fuse from "fuse.js";
import { API_BASE_URL } from "../../database/firebaseConfig";
  
interface BirdHistory {
  id: string;
  bird: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface BirdData {
  imageUrl: string;
  audubonUrl: string;
}

interface BirdSection {
  title: string;
  data: BirdHistory[];
}

interface BirdDoc {
  id: string;
  bird: string;
  latitude: number;
  longitude: number;
  timestamp: string; 
  userId?: string;   
}


/* const PAGE_SIZE = 20; */

const HistoryScreen: React.FC = () => {
  const [birds, setBirds] = useState<BirdHistory[]>([]);
  const [loading, setLoading] = useState(true);

  /*
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  */

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [birdDataMap, setBirdDataMap] = useState<{ [birdName: string]: BirdData }>({});

   const handleRefresh = async () => {
       setRefreshing(true);
       await fetchBirdsFromServer();
       setRefreshing(false);
     };
    
  /*
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
        q = query(q, where("bird", "==", selectedSpecies));
      }

      if (startDate || endDate) {
        q = query(
          q,
          where("timestamp", ">=", startDate || new Date(0)),
          where("timestamp", "<=", endDate || new Date())
        );
      }

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const fetchedBirds = snapshot.docs.map((doc) => ({
        id: doc.id,
        bird: doc.data().bird || "Unknown Bird",
        latitude: doc.data().latitude || 0,
        longitude: doc.data().longitude || 0,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      const newBirds = reset ? fetchedBirds : [...birds, ...fetchedBirds];
      setBirds(newBirds);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching birds:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  */

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearch(query);
    }, 300),
    []
  );

  const handleSearch = (query: string) => {
    debouncedSearch(query);
  };

/*
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBirds(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSpecies, startDate, endDate]);

  not using firestore approach, same as above*/


  const fetchDataForBird = async (birdName: string) => {
    try {
      const infoRes = await axios.get<{ url: string }>(
        `${API_BASE_URL}/bird-info`,
        { params: { bird: birdName } }
      );
      const audubonUrl = infoRes.data.url || "";
      if (!audubonUrl) {
        setBirdDataMap((prev) => ({
          ...prev,
          [birdName]: { imageUrl: "", audubonUrl: "https://www.audubon.org" },
        }));
        return;
      }
      const scrapeRes = await axios.get<{ image_url?: string }>(
        `${API_BASE_URL}/scrape-bird-info`,
        { params: { url: audubonUrl } }
      );
      const imageUrl = scrapeRes.data.image_url || "";
      setBirdDataMap((prev) => ({
        ...prev,
        [birdName]: { imageUrl, audubonUrl },
      }));
    } catch (error: any) {
      console.error("Error fetching data for bird:", birdName, error);
      setBirdDataMap((prev) => ({
        ...prev,
        [birdName]: { imageUrl: "", audubonUrl: "https://www.audubon.org" },
      }));
    }
  };

  useEffect(() => {
    const uniqueBirdNames = Array.from(new Set(birds.map((b) => b.bird)));
    const missingBirdNames = uniqueBirdNames.filter((name) => !(name in birdDataMap));
    missingBirdNames.forEach((birdName) => {
      fetchDataForBird(birdName);
    });
  }, [birds, birdDataMap]);


  
const filteredBySpeciesDate = useMemo(() => {
  return birds.filter((b) => {
    if (selectedSpecies && b.bird !== selectedSpecies) return false;

    if (startDate && b.timestamp < startDate) return false;

    if (endDate && b.timestamp > endDate) return false;

    return true;
  });
}, [birds, selectedSpecies, startDate, endDate]);

const fuse = useMemo(
  () => new Fuse(filteredBySpeciesDate, { keys: ["bird"], threshold: 0.3 }),
  [filteredBySpeciesDate]
);

const filteredBirds = useMemo(() => {
  if (!search) return filteredBySpeciesDate;

  const searchLower = search.trim().toLowerCase();
  const exactMatches = filteredBySpeciesDate.filter(
    (bird) => bird.bird.toLowerCase() === searchLower
  );
  if (exactMatches.length > 0) {
    return exactMatches;
  }

  return fuse.search(search).map((result) => result.item);
}, [search, fuse, filteredBySpeciesDate]);


  const groupByMonth = useCallback((data: BirdHistory[]): BirdSection[] => {
    const grouped: { [key: string]: BirdHistory[] } = {};
    data.forEach((item) => {
      const month = item.timestamp.toLocaleString("default", { month: "long", year: "numeric" });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(item);
    });
    return Object.keys(grouped).map((month) => ({ title: month, data: grouped[month] }));
  }, []);

  const sections = useMemo(() => groupByMonth(filteredBirds), [filteredBirds, groupByMonth]);

  const uniqueSpeciesList = useMemo(
    () =>
      Array.from(new Set(birds.map((b) => b.bird)))
        .map((species) => ({ label: species, value: species }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [birds]
  );

  
  
const fetchBirdsFromServer = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/my-birds`, {
      credentials: "include"
    });
    const data: BirdDoc[] = await response.json();
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setBirds(
      data.map((doc) => ({
        id: doc.id,
        bird: doc.bird,
        latitude: doc.latitude,
        longitude: doc.longitude,
        timestamp: new Date(doc.timestamp),
      }))
    );
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBirdsFromServer();
}, []);

    

  const handleFilterChange = (
    filterType: string,
    filterValue: string | { start?: Date; end?: Date } | null
  ) => {
    if (filterType === "species") {
      setSelectedSpecies(filterValue as string);
      setSearch("");
    } else if (filterType === "date") {
      if (typeof filterValue === "object" && filterValue !== null) {
        setStartDate(filterValue.start || null);
        setEndDate(filterValue.end || null);
      } else {
        setStartDate(null);
        setEndDate(null);
      }
      setSearch("");
    }
  };

  /*
  const loadMoreBirds = () => {
    if (!loadingMore && hasMore) {
      fetchBirds();
    }
  };
  */

  const renderBirdItem = useCallback(
    ({ item }: { item: BirdHistory }) => {
      const data = birdDataMap[item.bird] || { imageUrl: "", audubonUrl: "" };
      const imageUrl = data.imageUrl;
      const audubonUrl = data.audubonUrl;
      return (
        <View 
          accessible={true} 
          accessibilityLabel={`${item.bird}. Identified on ${item.timestamp.toLocaleDateString()} at ${item.timestamp.toLocaleTimeString()}`}
          accessibilityHint={`Double tap to open the Audobon.com website for ${item.bird}. This will leave the app and open an external browser.`}
          style={styles.historyCard} 
          key={item.id}
        >
          <Image
            source={
              imageUrl
                ? { uri: imageUrl }
                : require("../assets/img/logos/robinAppIcon.png")
            }
            style={styles.birdImage}
          />
          <View style={styles.entryDetails}>
            <TouchableOpacity
              onPress={() => {
                if (audubonUrl) {
                  Linking.openURL(audubonUrl);
                } else {
                  Alert.alert("No Audubon page found for this bird.");
                }
              }}
            >
              <Text style={[styles.birdName, { textDecorationLine: "underline" }]}>
                {item.bird}
              </Text>
            </TouchableOpacity>
            <Text style={styles.birdLocation}>
              Lat: {item.latitude}, Lon: {item.longitude}
            </Text>
          </View>
          <View style={styles.entryTime}>
            <Text style={styles.entryDate}>{item.timestamp.toLocaleDateString()}</Text>
            <Text style={styles.entryHour}>{item.timestamp.toLocaleTimeString()}</Text>
          </View>
        </View>
      );
    },
    [birdDataMap]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <Text
        accessibilityRole="header"
        accessibilityHint={`Continue forward to view birds you've identified in ${title}`}
        style={styles.monthHeader}
      >
        {title}
      </Text>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={{ width: '100%' }}>
          <SearchBar label="Search..." search={search} setSearch={setSearch} onSearch={handleSearch} />
        </View>
      </View>

      <View style={styles.topButtons}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityHint="Double tap to refresh your bird history."
          style={[styles.refreshButton, { width: '50%' }]} onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh History</Text>
        </TouchableOpacity>

        <Filter speciesList={uniqueSpeciesList} onFilterChange={handleFilterChange} />
      </View>

      {/* Bird List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderBirdItem}
          renderSectionHeader={renderSectionHeader}
          /*
          onEndReached={loadMoreBirds}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : !hasMore ? (
              <Text style={styles.endOfHistory}>End of History.</Text>
            ) : null
          }
            */
          
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  }
  initialNumToRender={20}
  maxToRenderPerBatch={10}
  windowSize={5}
/>

      
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8, 
    marginHorizontal: 12,
  },
  topButtons: {
    marginHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  monthHeader: {
    fontSize: 24,
    fontFamily: 'Radio Canada',
    color: colors.secondary,
    fontWeight: "bold",
    backgroundColor: colors.background,
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 6,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  birdImage: {
    width:65,
    height: 65,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: 50,
    marginRight: 10,
  },
  entryDetails: { 
    flex: 1, 
  },
  birdName: { 
    fontSize: 18, 
    fontFamily: 'Caprasimo',
    color: colors.primary, 
    marginBottom: 2 
  },
  birdLocation: { 
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: colors.text 
  },
  entryTime: {
    marginLeft: 6,
    fontFamily: 'Radio Canada',
    alignItems: "flex-end" 
  },
  entryDate: { 
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: colors.secondary, 
    fontWeight: "bold", 
    marginBottom: 2 
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Radio Canada',
  },
  entryHour: { 
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: colors.text 
  },
  endOfHistory: { 
    fontSize: 16,
    fontFamily: 'Radio Canada',
    color: colors.accent, 
    textAlign: "center", 
    marginVertical: 20 
  },
});

export default HistoryScreen;