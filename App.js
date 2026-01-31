import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const STORAGE_KEY = '@todos_v1';

export default function App() {
  const [task, setTask] = useState('');
  const [todoList, setTodoList] = useState([]);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setTodoList(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load todos', e);
    }
  };

  const saveTodos = async (newTodos) => {
    try {
      const jsonValue = JSON.stringify(newTodos);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save todos', e);
    }
  };

  const handleAddTask = () => {
    if (task.trim().length === 0) return;
    
    const newTodo = {
      id: Date.now().toString(),
      text: task,
      completed: false,
    };
    
    const newTodos = [...todoList, newTodo];
    setTodoList(newTodos);
    saveTodos(newTodos);
    setTask('');
    Keyboard.dismiss();
  };

  const toggleTodo = (id) => {
    const newTodos = todoList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setTodoList(newTodos);
    saveTodos(newTodos);
  };

  const deleteTodo = (id) => {
    const newTodos = todoList.filter(item => item.id !== id);
    setTodoList(newTodos);
    saveTodos(newTodos);
  };

  const renderTodoItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        style={styles.itemTextContainer} 
        onPress={() => toggleTodo(item.id)}
        testID={`todo-item-${item.text}`}
      >
        <Text style={[
          styles.itemText, 
          item.completed && styles.completedText
        ]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTodo(item.id)} testID="delete-button">
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Todos</Text>
      </View>

      <FlatList
        data={todoList}
        renderItem={renderTodoItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}
      >
        <TextInput
          style={styles.input}
          placeholder={'Write a task'}
          value={task}
          onChangeText={text => setTask(text)}
        />
        <TouchableOpacity onPress={() => handleAddTask()} testID="Add Task">
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>Add Task</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#AAA',
  },
  deleteButton: {
    color: '#FF3B30',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: '70%',
  },
  addWrapper: {
    width: 100,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
