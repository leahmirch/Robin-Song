// VoiceCommandHelp.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Accordion from '../components/Accordion'; // Adjusted path to the correct location
import { speakAppText } from '../services/voice/ttsHelper';
import colors from '../assets/theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


interface CommandItem {
 command: string;
 synonyms: string[];
 example: string;
 icon?: string; // optional icon name from MaterialCommunityIcons
}


interface CommandCategory {
 category: string;
 icon: string;
 commands: CommandItem[];
}


const commandData: CommandCategory[] = [
 {
   category: 'Navigation',
   icon: 'compass-outline',
   commands: [
     {
       command: 'Identify',
       synonyms: ['identify', 'go to identify', 'open identify', 'show identify', 'start identify'],
       example: 'robin identify',
       icon: 'microphone-outline',
     },
     {
       command: 'Forecast',
       synonyms: ['forecast', 'go to forecast', 'open forecast', 'show forecast', 'start forecast'],
       example: 'robin forecast',
       icon: 'weather-partly-cloudy',
     },
     {
       command: 'History',
       synonyms: ['history', 'go to history', 'open history', 'show history'],
       example: 'robin history',
       icon: 'history',
     },
     {
       command: 'Settings',
       synonyms: ['settings', 'go to settings', 'open settings', 'show settings'],
       example: 'robin settings',
       icon: 'cog-outline',
     },
   ],
 },
 {
   category: 'Detection',
   icon: 'radar',
   commands: [
     {
       command: 'start detection',
       synonyms: ['start detection', 'start identification', 'begin detection', 'activate detection'],
       example: 'robin start detection',
       icon: 'play-circle-outline',
     },
     {
       command: 'stop detection',
       synonyms: ['stop detection', 'stop identification', 'end detection', 'deactivate detection'],
       example: 'robin stop detection',
       icon: 'stop-circle-outline',
     },
   ],
 },
 {
   category: 'Chat',
   icon: 'message-text-outline',
   commands: [
     {
       command: 'chat',
       synonyms: ['chat', 'go to chat', 'open chat', 'show chat'],
       example: 'robin chat',
       icon: 'chat-outline',
     },
     {
       command: 'close chat',
       synonyms: ['close chat', 'exit chat', 'hide chat'],
       example: 'robin close chat',
       icon: 'close-circle-outline',
     },
     {
       command: 'delete chat',
       synonyms: ['delete chat', 'remove chat', 'erase chat'],
       example: 'robin delete chat',
       icon: 'delete-outline',
     },
   ],
 },
 {
   category: 'Reading Bird Info',
   icon: 'book-open-page-variant',
   commands: [
     {
       command: 'read description',
       synonyms: ['read description'],
       example: 'robin read description',
       icon: 'file-document-outline',
     },
     {
       command: 'read diet',
       synonyms: ['read diet'],
       example: 'robin read diet',
       icon: 'food-apple-outline',
     },
     {
       command: 'read habitat',
       synonyms: ['read habitat'],
       example: 'robin read habitat',
       icon: 'home-outline',
     },
     {
       command: 'read at a glance',
       synonyms: ['read at a glance'],
       example: 'robin read at a glance',
       icon: 'eye-outline',
     },
     {
       command: 'read feeding behavior',
       synonyms: ['read feeding behavior'],
       example: 'robin read feeding behavior',
       icon: 'food-fork-drink-outline',
     },
     {
       command: 'read migration and range',
       synonyms: ['read migration and range'],
       example: 'robin read migration and range',
       icon: 'map-marker-distance',
     },
     {
       command: 'stop reading',
       synonyms: ['stop reading', 'cancel reading', 'silence', 'stop'],
       example: 'robin stop reading',
       icon: 'volume-mute-outline',
     },
   ],
 },
 {
   category: 'Settings',
   icon: 'cog-outline',
   commands: [
     {
       command: 'enable voice commands',
       synonyms: ['enable voice commands', 'turn on voice commands', 'activate voice commands'],
       example: 'robin enable voice commands',
       icon: 'microphone-plus-outline',
     },
     {
       command: 'disable voice commands',
       synonyms: ['disable voice commands', 'turn off voice commands', 'deactivate voice commands'],
       example: 'robin disable voice commands',
       icon: 'microphone-minus-outline',
     },
     {
       command: 'enable audio feedback',
       synonyms: ['enable audio feedback', 'turn on audio feedback', 'activate audio feedback'],
       example: 'robin enable audio feedback',
       icon: 'volume-high-outline',
     },
     {
       command: 'disable audio feedback',
       synonyms: ['disable audio feedback', 'turn off audio feedback', 'deactivate audio feedback'],
       example: 'robin disable audio feedback',
       icon: 'volume-off-outline',
     },
     {
       command: 'enable location',
       synonyms: ['enable location', 'turn on location', 'activate location', 'enable location for predictions', 'turn on location for predictions'],
       example: 'robin enable location',
       icon: 'map-marker-outline',
     },
     {
       command: 'disable location',
       synonyms: ['disable location', 'turn off location', 'deactivate location', 'disable location for predictions', 'turn off location for predictions'],
       example: 'robin disable location',
       icon: 'map-marker-off-outline',
     },
   ],
 },
];


const VoiceCommandHelp: React.FC = () => {
 const [searchText, setSearchText] = useState('');


 // Filter commands based on search input (if any)
 const filteredData = commandData.map((section) => ({
   ...section,
   commands: section.commands.filter((cmd) =>
     cmd.command.toLowerCase().includes(searchText.toLowerCase())
   ),
 })).filter((section) => section.commands.length > 0);


 const handleTryIt = (example: string) => {
   // Speak the example aloud
   speakAppText(example);
 };


 return (
   <Accordion title="Voice Command Help" startIcon="microphone-outline">
     <View style={styles.helpContainer}>
       <TextInput
         style={styles.searchInput}
         placeholder="Search commands..."
         value={searchText}
         onChangeText={setSearchText}
       />
       <FlatList
         data={filteredData}
         keyExtractor={(item, index) => `${item.category}-${index}`}
         renderItem={({ item: section }) => (
           <View style={styles.section}>
             <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name={section.icon} size={20} color={colors.secondary} />
               <Text style={styles.categoryTitle}>{section.category}</Text>
             </View>
             {section.commands.map((cmd, idx) => (
               <View key={idx} style={styles.commandContainer}>
                 <View style={styles.headerRow}>
                   <View style={styles.commandHeader}>
                     <MaterialCommunityIcons name={cmd.icon || "chevron-right"} size={16} color={colors.primary} style={styles.commandIcon} />
                     <Text style={styles.commandTitle}>{cmd.command}</Text>
                   </View>
                   <TouchableOpacity style={styles.tryItButton} onPress={() => handleTryIt(cmd.example)}>
                     <Text style={styles.tryItText}>Try It</Text>
                   </TouchableOpacity>
                 </View>
                 <View style={styles.exampleRow}>
                   <Text style={styles.exampleText}>Example: {cmd.example}</Text>
                 </View>
                 <Text style={styles.commandSynonyms}>Synonyms: {cmd.synonyms.join(', ')}</Text>
               </View>
             ))}
           </View>
         )}
       />
     </View>
   </Accordion>
 );
};


const styles = StyleSheet.create({
 helpContainer: {
   marginTop: 10,
 },
 searchInput: {
   height: 40,
   borderColor: colors.accent,
   borderWidth: 1,
   borderRadius: 8,
   paddingHorizontal: 10,
   marginBottom: 10,
   fontFamily: 'Radio Canada',
   fontSize: 14,
   color: colors.text,
 },
 section: {
   marginBottom: 15,
   borderBottomWidth: 1,
   borderBottomColor: colors.accent,
   paddingBottom: 10,
 },
 sectionHeader: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 8,
 },
 categoryTitle: {
   fontSize: 18,
   fontFamily: 'Caprasimo',
   color: colors.secondary,
   marginLeft: 5,
 },
 commandContainer: {
   marginBottom: 10,
   paddingLeft: 10,
 },
 headerRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 commandHeader: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 commandIcon: {
   marginRight: 5,
 },
 commandTitle: {
   fontSize: 16,
   fontFamily: 'Radio Canada',
   color: colors.primary,
   fontWeight: 'bold',
 },
 tryItButton: {
   backgroundColor: colors.accent,
   paddingHorizontal: 10,
   paddingVertical: 5,
   borderRadius: 5,
 },
 tryItText: {
   fontSize: 14,
   fontFamily: 'Radio Canada',
   color: '#fff',
 },
 exampleRow: {
   marginTop: 4,
   marginBottom: 2,
 },
 exampleText: {
   fontSize: 14,
   fontFamily: 'Radio Canada',
   color: colors.text,
 },
 commandSynonyms: {
   fontSize: 14,
   fontFamily: 'Radio Canada',
   color: colors.text,
   marginTop: 3,
 },
});


export default VoiceCommandHelp;



