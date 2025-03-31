// VoiceCommandHelp.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { speakAppText } from '../services/voice/ttsHelper';
import colors from '../assets/theme/colors';


interface CommandItem {
 command: string;
 synonyms: string[];
 example: string;
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
       synonyms: ['identify', 'open identify'],
       example: 'Say "robin identify" to switch to the Identify screen.',
     },
     {
       command: 'Forecast',
       synonyms: ['forecast', 'open forecast'],
       example: 'Say "robin forecast" to view the weather forecast.',
     },
     {
       command: 'History',
       synonyms: ['history', 'open history'],
       example: 'Say "robin history" to view your bird detection history.',
     },
     {
       command: 'Settings',
       synonyms: ['settings', 'open settings'],
       example: 'Say "robin settings" to open the Settings screen.',
     },
   ],
 },
 {
   category: 'Detection',
   icon: 'microphone',
   commands: [
     {
       command: 'start detection',
       synonyms: ['start detection', 'begin detection'],
       example: 'Say "robin start detection" to begin bird detection.',
     },
     {
       command: 'stop detection',
       synonyms: ['stop detection', 'end detection'],
       example: 'Say "robin stop detection" to end bird detection.',
     },
   ],
 },
 {
   category: 'Chat',
   icon: 'chat-outline',
   commands: [
     {
       command: 'chat',
       synonyms: ['open chat'],
       example: 'Say "robin chat" to open the chat window.',
     },
     {
       command: 'close chat',
       synonyms: ['close chat', 'exit chat'],
       example: 'Say "robin close chat" to close the chat window.',
     },
     {
       command: 'delete chat',
       synonyms: ['delete chat', 'remove chat'],
       example: 'Say "robin delete chat" to remove the current chat.',
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
       example: 'Say "robin read description" to hear the bird description.',
     },
     {
       command: 'read diet',
       synonyms: ['read diet'],
       example: 'Say "robin read diet" to hear what the bird eats.',
     },
     {
       command: 'read habitat',
       synonyms: ['read habitat'],
       example: 'Say "robin read habitat" to hear about the bird habitat.',
     },
     {
       command: 'read at a glance',
       synonyms: ['read at a glance'],
       example: 'Say "robin read at a glance" for quick bird facts.',
     },
     {
       command: 'read feeding behavior',
       synonyms: ['read feeding behavior'],
       example: 'Say "robin read feeding behavior" to learn how the bird feeds.',
     },
     {
       command: 'read migration and range',
       synonyms: ['read migration and range'],
       example: 'Say "robin read migration and range" to hear migration details.',
     },
   ],
 },
 {
   category: 'Settings',
   icon: 'cog-outline',
   commands: [
     {
       command: 'enable voice commands',
       synonyms: ['enable voice commands'],
       example: 'Say "robin enable voice commands" to activate voice control.',
     },
     {
       command: 'disable voice commands',
       synonyms: ['disable voice commands'],
       example: 'Say "robin disable voice commands" to turn off voice control.',
     },
     {
       command: 'enable audio feedback',
       synonyms: ['enable audio feedback'],
       example: 'Say "robin enable audio feedback" to hear spoken feedback.',
     },
     {
       command: 'disable audio feedback',
       synonyms: ['disable audio feedback'],
       example: 'Say "robin disable audio feedback" to stop spoken feedback.',
     },
     {
       command: 'enable location',
       synonyms: ['enable location'],
       example: 'Say "robin enable location" to allow location-based predictions.',
     },
     {
       command: 'disable location',
       synonyms: ['disable location'],
       example: 'Say "robin disable location" to disable location-based predictions.',
     },
   ],
 },
];


const VoiceCommandHelp: React.FC = () => {
 const [expandedCategory, setExpandedCategory] = useState<string | null>(null);


 const toggleCategory = (category: string) => {
   setExpandedCategory(expandedCategory === category ? null : category);
 };


 const renderCommandItem = ({ item }: { item: CommandItem }) => {
   return (
     <View style={styles.commandItem}>
       <Text style={styles.commandTitle}>{item.command}</Text>
       <Text style={styles.synonymsTitle}>Synonyms:</Text>
       <View style={styles.synonymsContainer}>
         {item.synonyms.map((syn, index) => (
           <Text key={index} style={styles.synonymText}>
             • {syn}
           </Text>
         ))}
       </View>
       <Text style={styles.exampleTitle}>Example:</Text>
       <Text style={styles.exampleText}>{item.example}</Text>
       <TouchableOpacity
         style={styles.tryButton}
         onPress={() => speakAppText(item.example)}
       >
         <Text style={styles.tryButtonText}>Try It</Text>
       </TouchableOpacity>
     </View>
   );
 };


 const renderCategory = ({ item }: { item: CommandCategory }) => {
   const isExpanded = expandedCategory === item.category;
   return (
     <View style={styles.categoryContainer}>
       <TouchableOpacity
         style={styles.categoryHeader}
         onPress={() => toggleCategory(item.category)}
       >
         <MaterialCommunityIcons name={item.icon} size={24} color={colors.primary} />
         <Text style={styles.categoryTitle}>{item.category}</Text>
         <MaterialCommunityIcons
           name={isExpanded ? 'chevron-up' : 'chevron-down'}
           size={24}
           color={colors.primary}
         />
       </TouchableOpacity>
       {isExpanded && (
         <FlatList
           data={item.commands}
           keyExtractor={(item) => item.command}
           renderItem={renderCommandItem}
           style={styles.commandsList}
         />
       )}
     </View>
   );
 };


 return (
   <View style={styles.container}>
     <Text style={styles.header}>Voice Command Help</Text>
     <FlatList
       data={commandData}
       keyExtractor={(item) => item.category}
       renderItem={renderCategory}
     />
   </View>
 );
};


const styles = StyleSheet.create({
 container: {
   padding: 16,
   backgroundColor: colors.background,
   flex: 1,
 },
 header: {
   fontSize: 28,
   fontFamily: 'Caprasimo',
   color: colors.secondary,
   textAlign: 'center',
   marginBottom: 16,
 },
 categoryContainer: {
   marginBottom: 12,
   borderWidth: 1,
   borderColor: colors.accent,
   borderRadius: 8,
   backgroundColor: colors.card,
 },
 categoryHeader: {
   flexDirection: 'row',
   alignItems: 'center',
   padding: 12,
 },
 categoryTitle: {
   flex: 1,
   fontSize: 20,
   fontFamily: 'Caprasimo',
   color: colors.primary,
   marginLeft: 8,
 },
 commandsList: {
   paddingHorizontal: 12,
   paddingBottom: 12,
 },
 commandItem: {
   marginBottom: 16,
   padding: 8,
   backgroundColor: colors.background,
   borderRadius: 8,
 },
 commandTitle: {
   fontSize: 18,
   fontFamily: 'Caprasimo',
   fontWeight: 'bold',
   color: colors.secondary,
   marginBottom: 4,
 },
 synonymsTitle: {
   fontSize: 16,
   fontFamily: 'Radio Canada',
   color: colors.primary,
   marginBottom: 2,
 },
 synonymsContainer: {
   marginLeft: 8,
   marginBottom: 4,
 },
 synonymText: {
   fontSize: 14,
   fontFamily: 'Radio Canada',
   color: colors.text,
 },
 exampleTitle: {
   fontSize: 16,
   fontFamily: 'Radio Canada',
   color: colors.primary,
   marginBottom: 2,
 },
 exampleText: {
   fontSize: 14,
   fontFamily: 'Radio Canada',
   color: colors.text,
   marginBottom: 4,
 },
 tryButton: {
   alignSelf: 'flex-start',
   backgroundColor: colors.accent,
   paddingHorizontal: 12,
   paddingVertical: 6,
   borderRadius: 4,
 },
 tryButtonText: {
   fontSize: 14,
   fontFamily: 'Radio Canada',
   color: colors.white,
 },
});


export default VoiceCommandHelp;



