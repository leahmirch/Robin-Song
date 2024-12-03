import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity,} from 'react-native';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.background}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          {/* Bottom Block */}
          <View style={styles.bottomBlock}>
            {/* Owl Icon */}
            <View style={styles.emojiContainer}>
              <Text style={styles.emojiText}>X</Text>
            </View>

            {/* Welcome Text */}
            <Text style={styles.heading}>Hi Jodi, I’m Robin! Tweet Tweet!</Text>
            <Text style={styles.subHeading}>How can I help you?</Text>

            {/* Suggestions Section */}
            <Text style={styles.suggestionsHeading}>Suggestions</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>What does a Robin eat?</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                Tell me about a Robin’s life cycle.
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                What is the most common region to find a Robin?
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                What are some species similar to Robins?
              </Text>
            </View>

            {/* Bottom Input Placeholder */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputPlaceholder}>
                Ask me about birds or select a question...
              </Text>
              <View style={styles.arrowButton}>
                <Text style={styles.arrowButtonText}>↑</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
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
    height: '95%',
    backgroundColor: '#E7C4B8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ECA08D',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBlock: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C0483A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emojiText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heading: {
    fontFamily: 'Caprasimo',
    fontSize: 20,
    color: '#8485Bf',
    marginBottom: 5,
    textAlign: 'left',
  },
  subHeading: {
    fontFamily: 'Radio Canada',
    fontSize: 18,
    color: '#222E50',
    marginBottom: 20,
    textAlign: 'left',
    fontWeight: 'bold', 
  },
  suggestionsHeading: {
    fontFamily: 'Radio Canada',
    fontSize: 16,
    color: '#8485Bf',
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ECD4C7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    fontFamily: 'Radio Canada',
    fontSize: 14,
    color: '#222E50',
  },
  inputContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ECA08D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  inputPlaceholder: {
    fontFamily: 'Radio Canada',
    fontSize: 14,
    color: '#ECA08D',
    flex: 1,
  },
  arrowButton: {
    width: 30,
    height: 30,
    backgroundColor: '#ECA08D',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatModal;
