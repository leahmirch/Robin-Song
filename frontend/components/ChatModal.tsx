import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
  Image,
  findNodeHandle,
  AccessibilityInfo,
  Animated
} from 'react-native';
import colors from 'frontend/assets/theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatQuestion from './ChatQuestion';
import SearchBar from './SearchBar';
import { getAuth, onAuthStateChanged } from "firebase/auth";
const auth = getAuth();
import { db, API_BASE_URL } from '../../database/firebaseConfig';
import { collection, query, orderBy, where, onSnapshot, Timestamp } from 'firebase/firestore';
import * as Speech from 'expo-speech';     
import { usePreferences } from '../context/PreferencesContext';
import { speakAppText } from '../services/voice/ttsHelper';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../UserContext';




interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  voiceQuestion: string;
  setVoiceQuestion: React.Dispatch<React.SetStateAction<string>>;
}


interface ChatListScreenProps {
  chats: { id: string; title: string; date: Date }[];
  onSelectChat: (chatId: string) => void;
  onClose: () => void;
}


const ChatModal: React.FC<ChatModalProps> = ({
  visible,
  onClose,
  voiceQuestion,
  setVoiceQuestion
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [chatListVisible, setChatListVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{
    [key: string]: { id: string; content: string; sender: string; timestamp: Date }[]
  }>({});
  const [chats, setChats] = useState<{ id: string; title: string; date: Date }[]>([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingDots = useRef(new Animated.Value(0)).current;
  const [inputHeight, setInputHeight] = useState(40);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const userMessageRef = useRef(null);

  // NEW - we assumeudioFeedbackEnabled in Preferences
  const { audioFeedbackEnabled } = usePreferences();
  const lastAiMessageIdRead = useRef<string | null>(null);

  useEffect(() => {
    lastAiMessageIdRead.current = null;
  }, [selectedChat]);
  

 // fetch suggested questions
 useEffect(() => {
  const fetchSuggestedQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bird-questions`);
      if (response.ok) {
        const data = await response.json();
        setSuggestedQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching suggested questions:", error);
    }
  };


  if (visible || selectedChat === null) {
    fetchSuggestedQuestions();
  }
}, [visible, selectedChat]);


// watch auth state
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      console.log("Using default user ID");
      setUserId("FsDwDpHUD6XQU3egNNCOJLCTiNg1");
    }
  });
  return () => unsubscribe();
}, []);


// handle the typing indicator animation
useEffect(() => {
  if (isTyping) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDots, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(typingDots, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  }
}, [isTyping]); 

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const formattedChats = data.map((chat: any) => ({
            id: chat.chatId,
            title: chat.title,
            date: new Date(chat.createdAt?._seconds * 1000 || Date.now())
          }));
          setChats(formattedChats);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    
    fetchChats();


    if (!userId) return; 
    const q = query(
      collection(db, 'chats'),
      where("userId", "==", userId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        date: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      }));
      setChats(fetchedChats);
    });
    
    return () => unsubscribe();
  }, [userId]);

  
  
  
  useEffect(() => {
    if (selectedChat) {
        const q = query(collection(db, 'chats', selectedChat, 'messages'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        content: doc.data().content,
        sender: doc.data().sender === "AI" ? "AI" : "user",
        timestamp: doc.data().timestamp
          ? doc.data().timestamp.toDate()
          : new Date()
      }));             


      setChatMessages(prev => ({ ...prev, [selectedChat]: fetchedMessages }));
    });


        return () => {
            unsubscribe();
        };
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      const latestMessages = chatMessages[selectedChat];
      if (!latestMessages || latestMessages.length === 0) return;
  
      const lastMessage = latestMessages[latestMessages.length - 1];
  
      if (lastMessage.sender === 'user') {
        const userNode = findNodeHandle(userMessageRef.current);
        if (userNode) {
          AccessibilityInfo.setAccessibilityFocus(userNode);
        }
      }
    }
  }, [chatMessages, selectedChat]);


useEffect(() => {
  lastAiMessageIdRead.current = null;
  lastAiMessageContent.current = '';
}, [selectedChat]);

const lastAiMessageContent = useRef<string>('');

useEffect(() => {
  if (!selectedChat) return;
  const messages = chatMessages[selectedChat] || [];
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];

  if (lastMsg.content.trim() === '...') return;

  if (lastMsg.content.trim() === lastAiMessageContent.current) return;

  if (lastMsg.sender === 'AI' && lastMsg.id !== lastAiMessageIdRead.current) {
    lastAiMessageIdRead.current = lastMsg.id;
    lastAiMessageContent.current = lastMsg.content.trim();

    if (audioFeedbackEnabled) {
      console.log('Reading AI response out loud:', lastMsg.content);
      speakAppText(lastMsg.content, {
        pitch: 1.2, // Adjust pitch
      });
    }
  }
}, [
  selectedChat,
  selectedChat ? chatMessages[selectedChat]?.[chatMessages[selectedChat].length - 1]?.id : undefined,
  audioFeedbackEnabled
]);



 // send message to existing chat
 const sendMessage = async (threadID: string, message: string) => {
   if (!threadID) {
     return;
   }


   setMessage('');
   setIsTyping(true);


   try {
     setChatMessages(prev => ({
       ...prev,
       [threadID]: prev[threadID]?.filter(msg => msg.id !== 'typing-indicator') || [],
     }));


     setChatMessages(prev => ({
       ...prev,
       [threadID]: [
         ...(prev[threadID] || []),
         { id: 'typing-indicator', content: '...', sender: 'AI', timestamp: new Date() }
       ]
     }));


        const response = await fetch(`${API_BASE_URL}/chats/${threadID}/message`, {
          method: 'POST',
          credentials: "include",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message }),
        });
        

     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`ChatGPT API request failed with status ${response.status}: ${errorText}`);
     }


     const data = await response.json();
     setIsTyping(false);


     setChatMessages(prev => {
       const existingMessages = prev[threadID] || [];


       if (existingMessages.some(msg => msg.content === data.botMessage)) {
         return prev;
       }


       return {
         ...prev,
         [threadID]: existingMessages.filter(msg => msg.id !== 'typing-indicator').concat({
           id: data.botMessageId || new Date().toISOString(),
           content: data.botMessage,
           sender: "AI",
           timestamp: new Date()
         })
       };
     });


   } catch (error) {
     console.error('Error sending message:', error);
     setIsTyping(false);
     setChatMessages(prev => ({
       ...prev,
       [threadID]: prev[threadID]?.filter(msg => msg.id !== 'typing-indicator') || []
     }));
   }
 };


 // start a new chat
 const startNewChat = async (message: string) => {
   try {
     const chatTitle = message.substring(0, 30);


     const existingChat = chats.find(chat => chat.title === chatTitle);
     if (existingChat) {
       setSelectedChat(existingChat.id);
       await sendMessage(existingChat.id, message);
       return existingChat.id;
     }


        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          credentials: "include",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: chatTitle }),
        });        

     if (!response.ok) {
       throw new Error(`Failed to create chat: ${response.status}`);
     }


     const data = await response.json();
     const threadID = data.chatId;


     setChats(prev => {
       if (!prev.some(chat => chat.id === threadID)) {
         return [{ id: threadID, title: chatTitle, date: new Date() }, ...prev];
       }
       return prev;
     });


     setSelectedChat(threadID);
     await sendMessage(threadID, message);
     return threadID;
   } catch (error) {
     console.error('Error creating new chat:', error);
     return null;
   }
 };


 // handle the user pressing the send button
 const handleSendMessage = async () => {
   if (!message.trim()) {
     return;
   }


   let threadID = selectedChat;
   if (!threadID) {
     const newThreadID = await startNewChat(message);
     if (!newThreadID) {
       console.error("Failed to create a new chat.");
       return;
     }
     threadID = newThreadID;
   } else {
     await sendMessage(threadID, message);
   }
 };


 // NEW: If we get a voiceQuestion from TabNavigator and the modal is visible,
 // automatically send it, then clear voiceQuestion so it doesn't send repeatedly.
 useEffect(() => {
   if (visible && voiceQuestion.trim()) {
     console.log("Voice question detected:", voiceQuestion);
     setMessage(voiceQuestion);
     handleSendMessage();
     setVoiceQuestion('');
   }
 }, [voiceQuestion, visible]);


  const TypingIndicator = () => {
      return (
          <View style={[styles.chatBubble, styles.aiBubble, { alignSelf: 'flex-start', flexDirection: 'row' }]}>
              <Animated.Text style={[styles.chatText, { opacity: typingDots }]}>.</Animated.Text>
              <Animated.Text style={[styles.chatText, { opacity: typingDots }]}>.</Animated.Text>
              <Animated.Text style={[styles.chatText, { opacity: typingDots }]}>.</Animated.Text>
          </View>
      );
  };

  const { userData } = useUserData();
  const firstName = userData?.firstName || "Guest";
  
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.background}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={{ flex: 1 }}>
            {chatListVisible ? (
              <ChatListScreen
                chats={chats}
                onSelectChat={setSelectedChat}
                onClose={() => setChatListVisible(false)}
                onSetChats={setChats}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
              />
            ) : (
              <>
                <View style={styles.topBarContainer}>
                  <TouchableOpacity
                    accessibilityLabel='All chat list'
                    accessibilityRole='button'
                    accessibilityHint='Double tap to open a list of your chat history. Continue forward to continue the conversation.'
                    style={styles.newChatContainer}
                    onPress={() => {
                      setSelectedChat(null);
                      setChatListVisible(true);
                    }}
                  >
                    <Text style={styles.newChatText}>
                      {selectedChat ? chats.find((c) => c.id === selectedChat)?.title : 'New Chat'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel="Close"
                    accessibilityRole="button"
                    accessibilityHint="Double tap to close the Robin chatbot screen. Continue forward to continue the conversation."
                    style={styles.closeButton} 
                    onPress={onClose}
                  >
                    <Ionicons name="close" size={30} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  ref={scrollViewRef}
                  contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: inputHeight + 70 }}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  onContentSizeChange={() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                  }}
                  onLayout={() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                  }}
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  style={{ flex: 1 }}
                >
                  {selectedChat ? (
                    chatMessages[selectedChat]?.map((msg, index) => {
                      const isUserMessage = msg.sender === 'user';

                      return (
                        <View
                          ref={msg.sender === 'user' ? userMessageRef : null}
                          accessible={true}
                          accessibilityLabel={`${isUserMessage ? 'Your message says:' : `Robin's message says:`} ${msg.content}`}
                          accessibilityHint='Continue forward to continue the conversation.'
                          key={msg.id}
                          style={[styles.chatBubble, isUserMessage ? styles.userBubble : styles.aiBubble]}
                        >
                          <View style={{ flexDirection: 'column' }}>
                            <Text style={styles.chatText}>{msg.content}</Text>
                            <Text style={styles.chatTimestamp}>{msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.homeScreen}>
                      <View style={styles.leftContainer}>
                        <View accessible={true}>
                          <Image
                            source={require('frontend/assets/img/chatbotlogo.png')}
                            style={styles.chatbotImage}
                          />
                          <Text style={styles.heading}>Hi {firstName}, I'm Robin!</Text>
                          <Text style={styles.subHeading}>How can I help you?</Text>
                        </View>
                        
                        <Text
                          accessibilityRole='header'
                          accessibilityHint='Continue forward to view a list of question suggestions.'
                          style={styles.suggestionsHeading}
                        >
                          Suggestions
                        </Text>
  
                        {suggestedQuestions.length > 0 ? (
                          suggestedQuestions.map((question, index) => (
                            <ChatQuestion key={index} title={question} onPress={() => startNewChat(question)} />
                          ))
                        ) : (
                          <Text style={styles.loadingText}>Loading suggestions...</Text>
                        )}
                      </View>
                    </View>
                  )}
                  {isTyping && (
                    <View
                      accessible={true}
                      accessibilityLabel='Robin is thinking.'
                      style={[styles.chatBubble, styles.aiBubble, { alignSelf: 'flex-start', flexDirection: 'row' }]}
                    >
                      <Animated.Text style={[styles.chatText, { opacity: typingDots }]}>.</Animated.Text>
                      <Animated.Text style={[styles.chatText, { opacity: typingDots }]}>.</Animated.Text>
                      <Animated.Text style={[styles.chatText, { opacity: typingDots }]}>.</Animated.Text>
                    </View>
                  )}
                </ScrollView>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      accessibilityLabel="Text input field"
                      accessibilityHint="Enter a message to send to the Robin chatbot."
                      style={[styles.inputField, { minHeight: 25, maxHeight: 120 }]}
                      placeholder="Ask me about birds..."
                      placeholderTextColor={colors.accent}
                      value={message}
                      onChangeText={setMessage}
                      onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                      multiline
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity
                      accessibilityLabel='Send message button. Double tap to send your message.'
                      style={styles.arrowButton} 
                      onPress={handleSendMessage}
                    >
                      <Ionicons name="arrow-up" size={25} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );  
};


const ChatListScreen: React.FC<{
 chats: { id: string; title: string; date: Date }[];
 onSelectChat: (title: string) => void;
 onClose: () => void;
 onSetChats: React.Dispatch<React.SetStateAction<{ id: string; title: string; date: Date }[]>>;
 selectedChat: string | null;
 setSelectedChat: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ chats, onSelectChat, onClose, onSetChats, selectedChat, setSelectedChat }) => {
 const [search, setSearch] = useState("");


 const handleSearch = (query: string) => {
   setSearch(query);
 };


  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        onSetChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        if (selectedChat === chatId) {
          setSelectedChat(null);
        }
        Alert.alert("Chat Deleted", "The chat has been successfully deleted.");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
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
        <TouchableOpacity
          accessibilityLabel='Back arrow button'
          accessibilityHint='Double tap to go back to the Robin chatbot home screen. Continue forward to view your chat history.'
          onPress={onClose}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color={colors.primary} />
        </TouchableOpacity>

        <Text accessible={false} style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Radio Canada' }}>All Chats</Text>
        
        <TouchableOpacity
          accessibilityLabel='New chat button'
          accessibilityHint='Double tap to start a new chat. Continue forward to view your chat history.'
          onPress={() => {
            setSelectedChat(null); 
            onClose(); 
          }}
        >
          <MaterialCommunityIcons name="square-edit-outline" size={25} color={colors.primary}/>
        </TouchableOpacity>
      </View>

      <SearchBar label='Search for a chat' search={search} setSearch={setSearch} onSearch={handleSearch} />
      
      <ScrollView style={{height: '100%'}}>
        {Object.keys(groupedChats).map((section) =>
          groupedChats[section].length > 0 && (
            <View key={section}>
              <Text
                accessibilityRole='header'
                accessibilityHint={
                  section === 'Today' || section === 'Older than 30 Days'
                    ? `Continue forward to view chats you've had with Robin ${section}.`
                    : `Continue forward to view chats you've had with Robin this ${section}.`
                }
                style={styles.chatSectionLabel}
              >
                {section}
              </Text>
              <FlatList
                data={groupedChats[section].sort((a, b) => b.date.getTime() - a.date.getTime())}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.chatItem}>
                    <View
                      accessible={true}
                      accessibilityLabel={`Chat name: ${item.title}. Chat date: ${item.date.toLocaleDateString()}. `}
                      accessibilityHint='Double tap to open this chat.'
                    >
                      <TouchableOpacity style={styles.chatDescription} onPress={() => {
                        setSelectedChat(item.id); 
                        onClose(); 
                      }}>
                      <MaterialCommunityIcons name="chat-processing-outline" size={25} color={colors.secondary} style={{marginRight: 6}}/>
                      <Text style={styles.chatItemText} numberOfLines={1} ellipsizeMode="tail">
                        {item.title}
                      </Text>
                      <Text style={styles.chatItemDate}>{item.date.toLocaleDateString()}</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      accessibilityLabel='Delete chat button'
                      accessibilityHint={`Double tap to delete the ${item.title} chat.`}
                      onPress={() => handleDeleteChat(item.id)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={25} color={colors.secondary}/>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          )
        )}

       <TouchableOpacity style={styles.newChatButton} onPress={() => {
         setSelectedChat(null);
         onClose();
       }}>
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
   position: 'absolute',
   right: 10,
   top: 0,
   backgroundColor: colors.accent,
   borderRadius: 50,
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
   fontSize: 18,
   color: colors.secondary,
   marginBottom: 10,
   textAlign: 'left',
   fontWeight: 'bold',
 },
 inputContainer: {
   width: '100%',
   minHeight: 30,
   maxHeight: 120,
   backgroundColor: colors.chatGPTCardBackground,
   borderRadius: 25,
   borderWidth: 3,
   borderColor: colors.accent,
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 15,
   marginTop: 20,
   paddingVertical: 10,
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
   fontWeight: '500',
   color: colors.black,
   marginRight: 12,
   flexShrink: 1, 
   maxWidth: "80%",
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
   backgroundColor: `${colors.accent}80`,
   alignSelf: "flex-end",
 },
 aiBubble: {
   backgroundColor: `${colors.secondary}80`,
   alignSelf: "flex-start",
 },
 chatText: {
   fontFamily: "Radio Canada",
   fontSize: 16,
   color: colors.black,
 },
 homeScreen: {
   alignItems: 'center',
   justifyContent: 'center',
   flex: 1,
 }, 
 chatTimestamp: {
   fontSize: 10,
   fontFamily: 'Radio Canada',
   color: `${colors.black}80`,
   marginTop: 2,
   alignSelf: "flex-end",
 },
 loadingText: {
   fontFamily: "Radio Canada",
   fontSize: 14,
   color: colors.accent,
   textAlign: "center",
   marginTop: 10,
 },
 leftContainer: {
   alignSelf: 'flex-start',
   marginLeft: 10,
   marginBottom: 40,
 },
 birdIcon: {
     marginBottom: 10,
 },
 inputWrapper: {
   position: 'absolute',
   bottom: 15,
   left: 20,
   right: 20,
 },
 closeButtonWrapper: {
     position: 'absolute',
     right: 16,
     top: 10,
 },
 chatbotImage: {
   width: 80, 
   height: 80,
   resizeMode: 'contain',
   marginBottom: 10,
 },
});


export default ChatModal;

