import { StatusBar } from "expo-status-bar";
import { Checkbox } from "expo-checkbox";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Button,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";
import { useEffect, useState } from "react";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [todos, setTodos] = useState("");
  const [isChecked, setChecked] = useState(false);
  const [isModalVisibility, setIsModalVisibility] = useState(false);
  const [currentKey, setcurrentKey] = useState();
  useEffect(() => {
    loadTodos();
    getCategory();
  }, []);

  const travel = () => {
    setWorking(false);
    saveCategory(false);
  };
  const work = () => {
    setWorking(true);
    saveCategory(true);
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (editText) => setEditText(editText);
  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadTodos = async () => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data !== null) {
          setTodos(JSON.parse(data));
          console.log(JSON.parse(data));
        }
      })
      .catch((error) => console.error("Error loading todos:", error));
  };

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newTodo = {
      ...todos,
      [Date.now()]: { text, work: working, complete: isChecked },
    };
    setTodos(newTodo);
    await saveTodos(newTodo);
    setText("");
  };

  const deleteTodo = async (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: async () => {
          const newTodos = { ...todos };
          delete newTodos[key];
          setTodos(newTodos);
          await saveTodos(newTodos);
        },
      },
    ]);
    return;
  };

  const toggleTodoCompletion = async (index) => {
    const updateTodos = { ...todos };
    console.log("[BEFORE] : ", updateTodos[index].complete);
    updateTodos[index].complete = !updateTodos[index].complete;
    console.log("[AFTER] : ", updateTodos[index].complete);
    setTodos(updateTodos);
    await saveTodos(updateTodos);
  };

  const modifyTodo = async (index) => {
    console.log("[modifyTodo] key : ", index);
    const updateTodos = { ...todos };
    console.log(editText);
    updateTodos[index].text = editText;
    setTodos(updateTodos);
    await saveTodos(updateTodos);
  };

  const saveCategory = async (working) => {
    await AsyncStorage.setItem("isWorking", JSON.stringify(working));
  };

  const getCategory = async () => {
    const s = await AsyncStorage.getItem("isWorking");
    s !== null ? setWorking(JSON.parse(s)) : null;
  };

  const handleEditButtonPress = (key) => {
    console.log("[handleEditButtonPress] key : ", key);
    setcurrentKey(key);
    setIsModalVisibility(true);
  };

  const handleModalClose = () => {
    setIsModalVisibility(false);
  };

  const handleSaveButtonPress = async () => {
    console.log("[handleSaveButtonPress] key : ", currentKey);
    await modifyTodo(currentKey);
    setIsModalVisibility(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onSubmitEditing={addTodo}
        placeholder={working ? "Add To Do" : "Where do you want to go"}
        style={styles.input}
        returnKeyType="done"
        onChangeText={onChangeText}
        value={text}
      />

      <ScrollView>
        {Object.keys(todos).map((key) =>
          todos[key].work === working ? (
            <View style={styles.todo} key={key}>
              <Text style={styles.todoText}>{todos[key].text}</Text>
              <TouchableOpacity>
                <Checkbox
                  style={styles.checkbox}
                  value={todos[key].complete}
                  onValueChange={() => toggleTodoCompletion(key)}
                  color={todos[key].complete ? "red" : undefined}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEditButtonPress(key)}>
                <EvilIcons name="pencil" size={18} color="black" />
              </TouchableOpacity>
              {isModalVisibility && (
                <Modal
                  visible={isModalVisibility}
                  animationType="none"
                  transparent={true}
                  onRequestClose={handleModalClose}
                >
                  <View>
                    <TextInput
                      style={styles.input}
                      returnKeyType="done"
                      onChangeText={onChangeEditText}
                    />
                    <Button title="Save" onPress={handleSaveButtonPress} />
                    <Button title="Cancle" onPress={handleModalClose} />
                  </View>
                </Modal>
              )}
              <TouchableOpacity onPress={() => deleteTodo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
  },
  btnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 38,
  },
  input: {
    backgroundColor: "white",
    fontSize: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
  },
  todo: {
    backgroundColor: theme.todoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  checkbox: {
    margin: 8,
  },
});
