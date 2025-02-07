import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  FlatList, 
  ScrollView
} from 'react-native';
import colors from 'frontend/assets/theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatQuestion from './ChatQuestion';
import SearchBar from './SearchBar';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const [chatListVisible, setChatListVisible] = useState(false);
  const [chats, setChats] = useState([
    { id: '1', title: 'Robin diet discussion', date: new Date('2025-02-4T10:30:00') },
    { id: '2', title: 'Life cycle of a Robin', date: new Date('2025-02-01T10:30:00') },
    { id: '3', title: 'Robin migration patterns', date: new Date('2025-01-28T10:30:00') },
    { id: '4', title: 'Birdwatching techniques', date: new Date('2024-12-31T10:30:00') },
    { id: '5', title: 'Similar bird species', date: new Date('2024-12-16T10:30:00') },
  ]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const openChatList = () => setChatListVisible(true);
  const closeChatList = () => setChatListVisible(false);
  const selectChat = (title: string) => {
    setSelectedChat(title);
    setChatListVisible(false);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('User Message:', message);
      setMessage('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.background}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {chatListVisible ? (
                <ChatListScreen chats={chats} onSelectChat={selectChat} onClose={closeChatList} />
              ) : (
                <>
                  <View style={styles.topBarContainer}>
                    <TouchableOpacity style={styles.newChatContainer} onPress={openChatList}>
                      <Text style={styles.newChatText}> {selectedChat ? selectedChat : 'New Chat'} </Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color={colors.secondary}/>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', marginRight: 16 }}>
                      <TouchableOpacity style={{ marginRight: 8 }} onPress={() => Alert.alert('New Chat Button Pressed')}>
                        <MaterialCommunityIcons name="square-edit-outline" size={30} color={colors.primary}/>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={30} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  

                  <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <View style={styles.bottomBlock}>
                      <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="bird" size={30} color={colors.text}/>
                      </View>

                      <Text style={styles.heading}>Hi Jodi, I’m Robin! Tweet Tweet!</Text>
                      <Text style={styles.subHeading}>How can I help you?</Text>

                      <Text style={styles.suggestionsHeading}>Suggestions</Text>
                      <ChatQuestion title="What does a Robin eat?" onPress={() => Alert.alert('Question Button Pressed')}/>
                      <ChatQuestion title="Tell me about a Robin's life cycle." onPress={() => Alert.alert('Question Button Pressed')}/>
                      <ChatQuestion title="What is the most common region to find a Robin?" onPress={() => Alert.alert('Question Button Pressed')}/>
                      <ChatQuestion title="What are some species similar to Robins?" onPress={() => Alert.alert('Question Button Pressed')}/>

                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.inputField}
                          selectionColor={colors.primary}
                          placeholder="Ask me about birds or select a question..."
                          placeholderTextColor={colors.accent}
                        />
                        <TouchableOpacity style={styles.arrowButton} onPress={() => Alert.alert('Send Button Pressed')}>
                          <Ionicons name="arrow-up" size={25} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const ChatListScreen: React.FC<{ chats: { id: string; title: string; date: Date }[]; onSelectChat: (title: string) => void; onClose: () => void }> = ({ chats, onSelectChat, onClose }) => {
  const [search, setSearch] = useState("");

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const groupChatsByDate = (chats: { id: string; title: string; date: Date }[]) => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 31);

    const groupedChats: { [key: string]: { id: string; title: string; date: Date }[] } = {
      Today: [],
      'Past Week': [],
      'Past Month': [],
      'Older than 30 Days': []
    };

    chats.forEach(chat => {
      const chatDate = chat.date;
      if (chatDate.toDateString() === today.toDateString()) {
        groupedChats['Today'].push(chat);
      } else if (chatDate >= oneWeekAgo) {
        groupedChats['Past Week'].push(chat);
      } else if (chatDate >= oneMonthAgo) {
        groupedChats['Past Month'].push(chat);
      } else if (chatDate < thirtyDaysAgo) {
        groupedChats['Older than 30 Days'].push(chat);
      }
    });

    return groupedChats;
  };

  const filteredChats = chats.filter(chat => chat.title.toLowerCase().includes(search.toLowerCase()));

  const groupedChats = groupChatsByDate(filteredChats);

  return (
    <View style={{ padding: 20 }}>
      <View style={styles.chatListTopBar}>
        <TouchableOpacity onPress={onClose}>
          <MaterialCommunityIcons name="chevron-left" size={30} color={colors.primary} />
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Radio Canada' }}>All Chats</Text>
        
        <TouchableOpacity onPress={() => Alert.alert('New Chat Button Pressed')}>
          <MaterialCommunityIcons name="square-edit-outline" size={25} color={colors.primary}/>
        </TouchableOpacity>
      </View>

      <SearchBar label='Search for a chat' search={search} setSearch={setSearch} onSearch={handleSearch} />
      
      <ScrollView style={{height: '100%'}}>
        {Object.keys(groupedChats).map((section) =>
          groupedChats[section].length > 0 && (
            <View key={section}>
              <Text style={styles.chatSectionLabel}>{section}</Text>
              <FlatList
                data={groupedChats[section].sort((a, b) => b.date.getTime() - a.date.getTime())}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.chatItem}>
                    <TouchableOpacity style={styles.chatDescription} onPress={() => onSelectChat(item.title)}>
                      <MaterialCommunityIcons name="chat-processing-outline" size={25} color={colors.secondary} style={{marginRight: 6}}/>
                      <Text style={styles.chatItemText}>{item.title}</Text>
                      <Text style={styles.chatItemDate}>{item.date.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Delete Button Pressed')}>
                      <MaterialCommunityIcons name="trash-can-outline" size={25} color={colors.secondary}/>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          )
        )}

        <TouchableOpacity style={styles.newChatButton} onPress={() => Alert.alert('New Chat Pressed')}>
          <MaterialCommunityIcons name="plus" size={25} color={colors.offwhite} style={{marginRight: 10}}/>
          <Text style={styles.newChatButtonText}>Start New Chat</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '100%',
    height: '92%',
    backgroundColor: colors.chatGPTBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'relative',
  },
  topBarContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  newChatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  newChatText: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    backgroundColor: colors.accent,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBlock: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontFamily: 'Caprasimo',
    fontSize: 20,
    color: colors.secondary,
    marginBottom: 5,
    textAlign: 'left',
  },
  subHeading: {
    fontFamily: 'Radio Canada',
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  suggestionsHeading: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
    height: 50,
    backgroundColor: colors.chatGPTCardBackground,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  inputField: {
    fontFamily: 'Radio Canada',
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  arrowButton: {
    width: 30,
    height: 30,
    backgroundColor: colors.accent,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatListTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chatSectionLabel: {
    marginTop: 24,
    marginBottom: 4, 
    fontSize: 16,
    fontFamily: 'Radio Canada',
    fontWeight: 'bold',
    color: colors.primary,
  },
  chatItem: { 
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1, 
    borderBottomColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatDescription: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatItemText: { 
    fontSize: 16,
    fontFamily: 'Radio Canada',
    fontWeight: 500,
    color: colors.black,
    marginRight: 12,
  },
  chatItemDate: {
    fontSize: 12,
    fontFamily: 'Radio Canada',
    color: colors.secondary,
  },
  newChatButton: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 25,
    padding: 8,
    marginVertical: 24,
    alignItems: 'center',
  },
  newChatButtonText: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    fontWeight: 500,
    color: colors.offwhite,
  },
});

export default ChatModal;
