import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Divider,
  Portal,
  Modal,
  TextInput,
  RadioButton,
  Chip,
  IconButton,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TimePickerModal } from "react-native-paper-dates";

export default function ManageScreen() {
  const [habits, setHabits] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState("");
  const [repeat, setRepeat] = useState("Quotidien");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [time, setTime] = useState("");
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  useEffect(() => {
    const loadHabits = async () => {
      const storedHabits = await AsyncStorage.getItem("habits");
      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        const validatedHabits = parsedHabits.map((habit) => ({
          ...habit,
          repeat: habit.repeat || "Quotidien", // Assurer une valeur par défaut
          details: habit.details || "", // Garantir des détails
          time: habit.time || "", // Assurer une heure par défaut
        }));
        setHabits(validatedHabits);
      } else {
        setHabits([]);
      }
    };

    loadHabits();
  }, []);

  const saveHabits = async (updatedHabits) => {
    await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const showDrawer = (habit = null) => {
    if (habit) {
      setEditingHabit(habit);
      setNewHabit(habit.title);
      setRepeat(habit.repeat);
      setTime(habit.time);
      setSelectedDays(habit.repeat === "Hebdomadaire" ? habit.details?.split(", ") || [] : []);
      setSelectedDates(habit.repeat === "Mensuel" ? habit.details?.split(", ") || [] : []);
    }
    setVisible(true);
  };

  const hideDrawer = () => {
    setVisible(false);
    setNewHabit("");
    setRepeat("Quotidien");
    setSelectedDays([]);
    setSelectedDates([]);
    setTime("");
    setEditingHabit(null);
  };

  const saveHabit = async () => {
    let details = "";
    if (repeat === "Hebdomadaire") details = selectedDays.join(", ");
    if (repeat === "Mensuel") details = selectedDates.join(", ");

    if (newHabit.trim() !== "" && time) {
      let updatedHabits;
      if (editingHabit) {
        updatedHabits = habits.map((habit) =>
          habit.id === editingHabit.id
            ? { ...habit, title: newHabit, repeat, details, time }
            : habit
        );
      } else {
        updatedHabits = [
          ...habits,
          { id: Date.now().toString(), title: newHabit, repeat, details, time },
        ];
      }
      setHabits(updatedHabits);
      await saveHabits(updatedHabits);
      hideDrawer();
    }
  };

  const deleteHabit = async (id) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.headerText}>
        Gérer les Habitudes
      </Text>
      <Text style={styles.subText}>Ajoutez, modifiez ou supprimez vos habitudes.</Text>
      <Divider style={styles.divider} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {habits.map((habit) => (
          <Card key={habit.id} style={styles.card} mode="outlined">
            <Card.Content>
              <Text>{habit.title}</Text>
              <Text style={styles.repeatText}>
                Répétition : {habit.repeat} {habit.details && `(${habit.details})`}
              </Text>
              <Text style={styles.timeText}>À : {habit.time}</Text>
            </Card.Content>
            <Card.Actions>
              <IconButton
                icon="pencil"
                onPress={() => showDrawer(habit)}
                accessibilityLabel="Modifier"
              />
              <IconButton
                icon="delete"
                onPress={() => deleteHabit(habit.id)}
                accessibilityLabel="Supprimer"
              />
            </Card.Actions>
          </Card>
        ))}

        <Button mode="contained" style={styles.addButton} onPress={() => showDrawer()}>
          Ajouter une Habitude
        </Button>
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideDrawer}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            {editingHabit ? "Modifier l'Habitude" : "Nouvelle Habitude"}
          </Text>
          <TextInput
            label="Nom de l'habitude"
            value={newHabit}
            onChangeText={setNewHabit}
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.sectionTitle}>Répétition</Text>
          <RadioButton.Group onValueChange={(value) => setRepeat(value)} value={repeat}>
            <RadioButton.Item label="Quotidien" value="Quotidien" />
            <RadioButton.Item label="Hebdomadaire" value="Hebdomadaire" />
            <RadioButton.Item label="Mensuel" value="Mensuel" />
          </RadioButton.Group>

          {repeat === "Hebdomadaire" && (
            <>
              <Text style={styles.sectionTitle}>Choisir les jours</Text>
              <View style={styles.chipContainer}>
                {weekdays.map((day) => (
                  <Chip
                    key={day}
                    selected={selectedDays.includes(day)}
                    onPress={() => toggleDay(day)}
                    style={styles.chip}
                  >
                    {day}
                  </Chip>
                ))}
              </View>
            </>
          )}

          {repeat === "Mensuel" && (
            <>
              <Text style={styles.sectionTitle}>Choisir les dates</Text>
              <View style={styles.chipContainer}>
                {[...Array(31).keys()].map((day) => (
                  <Chip
                    key={day + 1}
                    selected={selectedDates.includes((day + 1).toString())}
                    onPress={() => toggleDate((day + 1).toString())}
                    style={styles.chip}
                  >
                    {day + 1}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Choisir une heure</Text>
          <Button onPress={() => setTimePickerVisible(true)}>Sélectionner l'heure</Button>
          <Text style={styles.timeDisplay}>{time && `Heure : ${time}`}</Text>
          <TimePickerModal
            visible={timePickerVisible}
            onDismiss={() => setTimePickerVisible(false)}
            onConfirm={({ hours, minutes }) => {
              setTime(`${hours}:${minutes < 10 ? `0${minutes}` : minutes}`);
              setTimePickerVisible(false);
            }}
            hours={12}
            minutes={0}
          />

          <Button mode="contained" onPress={saveHabit} style={styles.saveButton}>
            Sauvegarder
          </Button>
          <Button onPress={hideDrawer} style={styles.cancelButton}>
            Annuler
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  headerText: { marginBottom: 8, textAlign: "center" },
  subText: { marginBottom: 16, textAlign: "center", color: "gray" },
  divider: { marginBottom: 16 },
  scrollContainer: { paddingBottom: 16 },
  card: { marginBottom: 8, borderRadius: 8 },
  repeatText: { color: "gray", marginTop: 4 },
  addButton: { marginTop: 16, marginBottom: 16 },
  modal: { backgroundColor: "white", padding: 16, marginHorizontal: 32, borderRadius: 8 },
  modalTitle: { marginBottom: 16, textAlign: "center" },
  input: { marginBottom: 16 },
  sectionTitle: { marginBottom: 8, fontWeight: "bold" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  chip: { margin: 4 },
  saveButton: { marginBottom: 8 },
  cancelButton: { alignSelf: "center" },
  timeText: { marginTop: 8, color: "gray" },
  timeDisplay: { marginTop: 8, fontSize: 16, color: "gray" },
});
