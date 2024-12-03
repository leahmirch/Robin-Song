import React from 'react';
import {SafeAreaView, View, Text, StyleSheet, Image, ScrollView,} from 'react-native';
import colors from 'frontend/assets/theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const IdentifyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title */}
        <Text style={styles.title}>Identification</Text>

        {/* Status Badges with Central Button */}
        <View style={styles.statusContainer}>
          <View style={styles.badge}>
          <Text style={styles.badgeDate}> </Text>
            <Text style={styles.badgeText}>Identification Stopped</Text>
            <Text style={styles.badgeDate}> </Text>
          </View>
          <View style={styles.listeningButton}>
            <MaterialCommunityIcons
              name="microphone-off"
              size={36}
              color={colors.card} 
            />
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Bird Last Identified On</Text>
            <Text style={styles.badgeDate}>
              Tuesday, November 5 2024 at 1:15 P.M.
            </Text>
          </View>
        </View>

        {/* Species Name */}
        <Text style={styles.speciesName}>American Robin</Text>
        <Text style={styles.speciesLatin}>Turdus Migratorius</Text>

        {/* Robin Image */}
        <View style={styles.robinContainer}>
          <Image
            source={require('frontend/assets/img/robin.png')}
            style={styles.robinImage}
          />
        </View>

        {/* Sections with Lines */}
        <View>
          <Text style={styles.sectionHeading}>Physical Description</Text>
          <Text style={styles.sectionText}>
            American Robins are fairly large songbirds with a large, round body, long legs, and fairly long tail. Robins are the largest North American thrushes, and their profile offers a good chance to learn the basic shape of most thrushes. Robins make a good reference point for comparing the size and shape of other birds, too. American Robins are gray-brown birds with warm orange underparts and dark heads. In light, a white patch on the lower belly and under the tail can be conspicuous. Compared with males, females have paler heads that contrast less with the gray back.
          </Text>
        </View>
        <View style={styles.separator} />

        <View>
          <Text style={styles.sectionHeading}>Overview</Text>
          <Text style={styles.sectionText}>
            A very familiar bird over most of North America, running and hopping on lawns with upright stance, often nesting on porches and windowsills. The Robin's rich caroling is among the earliest bird songs heard at dawn in spring and summer, often beginning just before first light. In fall and winter, robins may gather by the hundreds in roaming flocks, concentrating at sources of food.
          </Text>
        </View>
        <View style={styles.separator} />

        <View>
          <Text style={styles.sectionHeading}>Habitat</Text>
          <Text style={styles.sectionText}>
            Cities, towns, lawns, farmland, forests; in winter, berry-bearing trees. Over most of the continent, summers occur wherever there are trees for nest sites and mud for nest material. In the arid southwest, summers mainly occur in coniferous forests in mountains, rarely in well-watered lowland suburbs. In winter, flocks gather in wooded areas where trees or shrubs have good crops of berries.
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
    fontFamily: 'Caprasimo',
    fontSize: 48,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badge: {
    width: '35%',
    backgroundColor: colors.card,
    borderRadius: 15,
    paddingVertical: 15, 
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    fontFamily: 'Caprasimo',
    fontSize: 17, 
    color: colors.primary,
    textAlign: 'center',
  },
  badgeDate: {
    fontFamily: 'Radio Canada',
    fontSize: 13, 
    color: colors.text,
    textAlign: 'center',
  },
  listeningButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  speciesName: {
    fontFamily: 'Caprasimo',
    fontSize: 36,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  speciesLatin: {
    fontFamily: 'Radio Canada Italic',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  robinContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  robinImage: {
    width: 350,
    height: 250,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: colors.primary,
  },
  sectionHeading: {
    fontFamily: 'Caprasimo',
    fontSize: 28, 
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionText: {
    fontFamily: 'Radio Canada',
    fontSize: 16, 
    color: colors.text,
    textAlign: 'left',
  },
  separator: {
    height: 2,
    backgroundColor: colors.accent,
    marginVertical: 10,
  },
});

export default IdentifyScreen;
