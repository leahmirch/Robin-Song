import React, { useState, useEffect } from 'react';
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
import { getAuth, onAuthStateChanged } from "firebase/auth";
const auth = getAuth();
import { db, API_BASE_URL } from '../../database/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, doc, Timestamp } from 'firebase/firestore';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const [chatListVisible, setChatListVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ [key: string]: { id: string; content: string; sender: string }[] }>({});
  const [chats, setChats] = useState<{ id: string; title: string; date: Date }[]>([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<
  { id: string; content: string; sender: string }[]
>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User detected:", user.uid);
        setUserId(user.uid);
      } else {
        console.log("No user detected");
      }
    });
    return () => unsubscribe();
  }, []);  

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        date: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
      setChats(fetchedChats);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const q = query(collection(db, 'chats', selectedChat, 'messages'), orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(q, snapshot => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as { id: string; content: string; sender: string }[];
  
        console.log(`Fetched messages for thread ${selectedChat}:`, fetchedMessages);
        setChatMessages(prev => ({ ...prev, [selectedChat]: fetchedMessages }));
      });
      return () => unsubscribe();
    }
  }, [selectedChat]);  

  const startNewChat = async (message: string) => {
    if (!userId) {
      console.log("startNewChat: No user ID found.");
      return null;
    }
  
    try {
      console.log("Creating a new chat with message:", message);
      const chatTitle = message.substring(0, 20); // Limit title length
  
      // Generate a thread ID for Firebase
      const newChatRef = await addDoc(collection(db, 'chats'), {
        userId,
        title: chatTitle,
        createdAt: Timestamp.now(),
      });
  
      const threadID = newChatRef.id;
      console.log("New chat created with ID:", threadID);
  
      setChats(prev => [{ id: threadID, title: chatTitle, date: new Date() }, ...prev]);
      setSelectedChat(threadID);
  
      await sendMessage(threadID, message);
  
      return threadID;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  };
  
  const sendMessage = async (threadID: string, message: string) => {
    console.log(`Sending message to ChatGPT under thread: ${threadID}`);
  
    if (!userId || !threadID) {
      console.log("sendMessage aborted: Missing user ID or thread ID.", { userId, threadID });
      return;
    }
  
    try {
      console.log(`Storing message in Firestore under thread ${threadID}`);
      const messageRef = collection(db, 'chats', threadID, 'messages');
  
      await addDoc(messageRef, {
        role: 'user',
        content: message,
        sender: userId,
        timestamp: Timestamp.now(),
      });
  
      console.log("Message stored. Sending request to ChatGPT...");
  
      const response = await fetch(`${API_BASE_URL}/api/chats/${threadID}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadID, userId, message }),
      });
  
      console.log(`Response Status: ${response.status}`);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ChatGPT API request failed with status ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("ChatGPT Response received:", data);
  
      if (data && data.botMessage) {
        console.log(`Storing bot response under thread ${threadID}`);
        await addDoc(messageRef, {
          role: 'assistant',
          content: data.botMessage,
          sender: 'AI',
          timestamp: Timestamp.now(),
        });
  
        console.log("Bot response stored successfully.");
        
        setChatMessages(prev => ({
          ...prev,
          [threadID]: [...(prev[threadID] || []), { id: Date.now().toString() + "_bot", content: data.botMessage, sender: "AI" }],
        }));
      } else {
        console.warn("ChatGPT response is missing 'botMessage'", data);
      }
  
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };  

  const handleSendMessage = async () => {
    if (!message.trim()) {
      console.log("No message entered.");
      return;
    }
  
    let threadID = selectedChat;
    
    if (!threadID) {
      console.log("No chat selected, starting a new chat.");
      threadID = await startNewChat(message);
      if (!threadID) {
        console.error("Failed to create a new chat.");
        return;
      }
      setSelectedChat(threadID);
    }
  
    await sendMessage(threadID, message);
  };
  
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.background}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {chatListVisible ? (
                <ChatListScreen chats={chats} onSelectChat={setSelectedChat} onClose={() => setChatListVisible(false)} />
              ) : (
                <>
                  <View style={styles.topBarContainer}>
                  <TouchableOpacity style={styles.newChatContainer} onPress={() => {
                    setSelectedChat(null);
                    setChatListVisible(true);
                  }}>
                    <Text style={styles.newChatText}>{selectedChat ? chats.find(c => c.id === selectedChat)?.title : 'New Chat'}</Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color={colors.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                      <Ionicons name="close" size={30} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 10, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
                    {selectedChat ? (
                      chatMessages[selectedChat]?.map((msg) => (
                        <View key={msg.id} style={[styles.chatBubble, msg.sender === "user" ? styles.userBubble : styles.aiBubble]}>
                          <Text style={styles.chatText}>{msg.content}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.homeScreen}>
                        <Text style={styles.heading}>Hi Jodi, I’m Robin! Tweet Tweet!</Text>
                        <Text style={styles.subHeading}>How can I help you?</Text>
                        <Text style={styles.suggestionsHeading}>Suggestions</Text>
                        <ChatQuestion title="What does a Robin eat?" onPress={() => startNewChat("What does a Robin eat?")} />
                        <ChatQuestion title="Tell me about a Robin's life cycle." onPress={() => startNewChat("Tell me about a Robin's life cycle.")} />
                        <ChatQuestion title="What is the most common region to find a Robin?" onPress={() => startNewChat("What is the most common region to find a Robin?")} />
                        <ChatQuestion title="What are some species similar to Robins?" onPress={() => startNewChat("What are some species similar to Robins?")} />
                      </View>
                    )}
                  </ScrollView>
                    <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputField}
                      placeholder="Ask me about birds..."
                      placeholderTextColor={colors.accent}
                      value={message}
                      onChangeText={setMessage}
                      onSubmitEditing={(event) => {
                        console.log("TextInput submit event triggered:", event.nativeEvent.text);
                        handleSendMessage();
                      }}
                      blurOnSubmit={false}
                    />
                      <TouchableOpacity style={styles.arrowButton} onPress={handleSendMessage}>
                        <Ionicons name="arrow-up" size={25} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
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
  chatBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  
  aiBubble: {
    backgroundColor: colors.secondary,
    alignSelf: "flex-start",
  },
  chatText: {
    fontFamily: "Radio Canada",
    fontSize: 14,
    color: colors.white,
  },
  homeScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },  
});

export default ChatModal;
