import React from 'react';
import { Modal, View, Text, Button, StyleSheet, BackHandler } from 'react-native';

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
            <Text style={styles.text}>This is the chat modal!</Text>
            <Button title="Close Modal" onPress={onClose} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5',
  },
  container: {
    width: '100%',
    height: '95%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E7C4B8',
  },
  text: {
    fontFamily: 'Radio Canada',
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ChatModal;
