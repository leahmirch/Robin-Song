// VoiceCommandHelp.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { speakAppText } from '../services/voice/ttsHelper';
import Accordion from '../components/Accordion';
import colors from '../assets/theme/colors';

interface CommandItem {
  command: string;
  synonyms: string[];
  example: string;
  icon?: string;
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
        icon: 'microphone-outline',
      },
      {
        command: 'Forecast',
        synonyms: ['forecast', 'open forecast'],
        example: 'Say "robin forecast" to view the weather forecast.',
        icon: 'weather-partly-cloudy',
      },
      {
        command: 'History',
        synonyms: ['history', 'open history'],
        example: 'Say "robin history" to view your detection history.',
        icon: 'history',
      },
      {
        command: 'Settings',
        synonyms: ['settings', 'open settings'],
        example: 'Say "robin settings" to open the Settings screen.',
        icon: 'cog-outline',
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
        icon: 'play-circle-outline',
      },
      {
        command: 'stop detection',
        synonyms: ['stop detection', 'end detection'],
        example: 'Say "robin stop detection" to end bird detection.',
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
        synonyms: ['open chat'],
        example: 'Say "robin chat" to open the chat window.',
        icon: 'chat',
      },
      {
        command: 'close chat',
        synonyms: ['close chat', 'exit chat'],
        example: 'Say "robin close chat" to close the chat window.',
        icon: 'chat-remove-outline',
      },
      {
        command: 'ask question',
        synonyms: ['ask question', 'question', 'query', 'inquire'],
        example: 'Say "robin ask question <your question>" to send your question.',
        icon: 'help-circle-outline',
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
        icon: 'file-document-outline',
      },
      {
        command: 'read diet',
        synonyms: ['read diet'],
        example: 'Say "robin read diet" to hear what the bird eats.',
        icon: 'nutrition',
      },
      {
        command: 'read habitat',
        synonyms: ['read habitat'],
        example: 'Say "robin read habitat" to hear about the bird habitat.',
        icon: 'pine-tree-box',
      },
      {
        command: 'read at a glance',
        synonyms: ['read at a glance'],
        example: 'Say "robin read at a glance" for quick bird facts.',
        icon: 'bird',
      },
      {
        command: 'read feeding behavior',
        synonyms: ['read feeding behavior'],
        example: 'Say "robin read feeding behavior" to learn how the bird feeds.',
        icon: 'feather',
      },
      {
        command: 'read migration and range',
        synonyms: ['read migration and range'],
        example: 'Say "robin read migration and range" to hear migration details.',
        icon: 'map-marker-distance',
      },
      {
        command: 'stop reading',
        synonyms: ['stop reading', 'cancel reading', 'silence', 'stop'],
        example: 'Say "robin stop reading" to cancel any ongoing speech.',
        icon: 'stop-circle-outline',
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
        icon: 'microphone',
      },
      {
        command: 'disable voice commands',
        synonyms: ['disable voice commands'],
        example: 'Say "robin disable voice commands" to turn off voice control.',
        icon: 'microphone-off',
      },
      {
        command: 'enable audio feedback',
        synonyms: ['enable audio feedback'],
        example: 'Say "robin enable audio feedback" to hear spoken feedback.',
        icon: 'volume-plus',
      },
      {
        command: 'disable audio feedback',
        synonyms: ['disable audio feedback'],
        example: 'Say "robin disable audio feedback" to stop spoken feedback.',
        icon: 'volume-mute',
      },
      {
        command: 'enable location',
        synonyms: ['enable location'],
        example: 'Say "robin enable location" to allow location-based predictions.',
        icon: 'map-marker-outline',
      },
      {
        command: 'disable location',
        synonyms: ['disable location'],
        example: 'Say "robin disable location" to disable location-based predictions.',
        icon: 'map-marker-off-outline',
      },
      {
        command: 'logout',
        synonyms: ['logout', 'log out', 'sign out', 'exit account'],
        example: 'Say "robin logout" to log out of your account.',
        icon: 'logout',
      },
      {
        command: 'login',
        synonyms: ['login', 'log in', 'sign in'],
        example: 'Say "robin login" to log into your account.',
        icon: 'login-variant',
      },
    ],
  },
];

const VoiceCommandHelp: React.FC = () => {
  const renderCommandItem = (item: CommandItem, key: string ) => (
    <View key={key} style={styles.commandItem}>
      <View
        accessible={true}
        accessibilityLabel={`${item.command} command.`}
        accessibilityHint={`Continue forward to view information for the ${item.command} command`}
        accessibilityRole='header'
        style={styles.commandHeader}
      >
        {item.icon && (
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            style={styles.commandIcon}
            color={colors.secondary}
          />
        )}
        <Text style={styles.commandTitle}>{item.command}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View
          accessible={true}
          accessibilityLabel={`Example of ${item.command} command: ${item.example}`}
        >
          <Text style={styles.exampleTitle}>Example:</Text>
          <Text style={styles.exampleText}>{item.example}</Text>
        </View>

        <View
          accessible={true}
          accessibilityLabel={`Synonyms that can also be used for the ${item.command} command: ${item.synonyms}`}
        >
          <Text style={styles.synonymsTitle}>Synonyms:</Text>
          <View style={styles.synonymsContainer}>
            {item.synonyms.map((syn, index) => (
              <Text key={index} style={styles.synonymText}>
                • {syn}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.header}>Voice Command Help</Text>
      {commandData.map((item) => (
        <Accordion key={item.category} title={item.category} startIcon={item.icon}>
          {item.commands.map((command) =>
            renderCommandItem(command, `${item.category}-${command.command}`)
          )}
        </Accordion>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Caprasimo',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  commandItem: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: colors.chatGPTBackground,
    borderRadius: 8,
  },
  commandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commandIcon: {
    marginRight: 8,
  },
  commandTitle: {
    fontSize: 16,
    fontFamily: 'Radio Canada',
    fontWeight: 'bold',
    color: colors.secondary,
  },
  tryButton: {
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
  detailsContainer: {
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: colors.primary,
    marginBottom: 2,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: '#222E50',
    marginBottom: 4,
  },
  synonymsTitle: {
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: colors.primary,
    marginBottom: 2,
  },
  synonymsContainer: {
    marginLeft: 8,
  },
  synonymText: {
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: '#222E50',
  },
});

export default VoiceCommandHelp;
