import React from 'react';
import {SafeAreaView, ScrollView, View, Text, StyleSheet, TextInput, Image, TouchableOpacity,} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../assets/theme/colors';

const HistoryScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title */}
        <Text style={styles.title}>History</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={16}
              color={colors.primary}
            />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.accent}
          />
        </View>

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

        {/* November Header */}
        <Text style={styles.monthHeader}>November 2024</Text>

        {/* History Entries */}
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <View style={styles.historyCard} key={`november-robin-${index}`}>
              <Image
                source={require('../assets/img/robin.png')}
                style={styles.birdImage}
              />
              <View style={styles.entryDetails}>
                <Text style={styles.birdName}>American Robin</Text>
                <Text style={styles.birdLocation}>Hines Park</Text>
              </View>
              <View style={styles.entryTime}>
                <Text style={styles.entryDate}>November 19, 2024</Text>
                <Text style={styles.entryHour}>2:22:22 PM</Text>
              </View>
            </View>
          ))}

        {/* October Header */}
        <Text style={styles.entryTime}></Text>
        <Text style={styles.monthHeader}>October 2024</Text>

        {/* October Entries */}
        {Array(2)
          .fill(null)
          .map((_, index) => (
            <View style={styles.historyCard} key={`october-wren-${index}`}>
              <Image
                source={require('../assets/img/carolina.png')}
                style={styles.birdImage}
              />
              <View style={styles.entryDetails}>
                <Text style={styles.birdName}>Carolina Wren</Text>
                <Text style={styles.birdLocation}>Wayne County</Text>
              </View>
              <View style={styles.entryTime}>
                <Text style={styles.entryDate}>October 19, 2024</Text>
                <Text style={styles.entryHour}>1:23:45 PM</Text>
              </View>
            </View>
          ))}

        {/* End of History */}
        <Text style={styles.endOfHistory}>End of History.</Text>
        <Text style={styles.endOfHistory}></Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chatGPTCardBackground,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
    height: 40,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  searchIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchInput: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: colors.accent,
    flex: 1,
  },
  filterButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    height: 35,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
  },
  monthHeader: {
    fontFamily: 'Radio Canada',
    fontSize: 24,
    color: colors.secondary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chatGPTCardBackground,
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
    fontFamily: 'Caprasimo',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 2,
  },
  birdLocation: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: colors.text,
  },
  entryTime: {
    alignItems: 'flex-end',
  },
  entryDate: {
    fontFamily: 'Radio Canada',
    fontSize: 14,
    color: colors.secondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  entryHour: {
    fontFamily: 'Radio Canada',
    fontSize: 14,
    color: colors.text,
  },
  endOfHistory: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: colors.accent,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistoryScreen;
