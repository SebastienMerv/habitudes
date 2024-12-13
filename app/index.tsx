import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, Checkbox, Divider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TodayScreen() {
  const [habits, setHabits] = useState([]);
  const [todayHabits, setTodayHabits] = useState({ uncompleted: [], completed: [] });

  useEffect(() => {
    const loadHabits = async () => {
      const storedHabits = await AsyncStorage.getItem("habits");
      if (storedHabits) {
        const allHabits = JSON.parse(storedHabits);
        filterTodayHabits(allHabits);
        setHabits(allHabits);
      } else {
        setHabits([]);
        setTodayHabits({ uncompleted: [], completed: [] });
      }
    };

    loadHabits();
  }, []);

  const saveHabits = async (updatedHabits) => {
    try {
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
    } catch (e) {
      console.error("Erreur en sauvegardant les habitudes :", e);
    }
  };

  const toggleHabit = (id) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updatedHabits);
    saveHabits(updatedHabits);

    // Mettre à jour les habitudes du jour
    filterTodayHabits(updatedHabits);
  };

  const filterTodayHabits = (allHabits) => {
    const today = new Date();
    const dayOfWeek = today.toLocaleString("fr-FR", { weekday: "long" }).toLowerCase();
    const date = today.getDate().toString();

    const filtered = allHabits.filter((habit) => {
      if (habit.repeat === "Quotidien") return true;
      if (habit.repeat === "Hebdomadaire") {
        const habitDays = habit.details?.split(", ").map((d) => d.toLowerCase()) || [];
        return habitDays.includes(dayOfWeek);
      }
      if (habit.repeat === "Mensuel") {
        const habitDates = habit.details?.split(", ") || [];
        return habitDates.includes(date);
      }
      return false;
    });

    setTodayHabits({
      uncompleted: filtered.filter((habit) => !habit.completed),
      completed: filtered.filter((habit) => habit.completed),
    });
  };

  const renderHabit = ({ item }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.cardContent}>
        <Checkbox
          status={item.completed ? "checked" : "unchecked"}
          onPress={() => toggleHabit(item.id)}
        />
        <Text style={[styles.habitText, item.completed && styles.completedText]}>
          {item.title} ({item.time + "h"})
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.headerText}>
        Habitudes du Jour
      </Text>
      <Divider style={styles.divider} />
      <FlatList
        data={todayHabits.uncompleted}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune habitude à faire aujourd'hui.</Text>}
      />
      <Divider style={styles.divider} />
      <Text style={styles.completedHeaderText}>Habitudes terminées</Text>
      <FlatList
        data={todayHabits.completed}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune habitude terminée.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  headerText: { marginBottom: 8, textAlign: "center" },
  divider: { marginVertical: 16 },
  listContainer: { paddingBottom: 16 },
  card: { marginBottom: 8, borderRadius: 8 },
  cardContent: { flexDirection: "row", alignItems: "center" },
  habitText: { fontSize: 16, marginLeft: 8, flex: 1 },
  completedText: { textDecorationLine: "line-through", color: "gray" },
  emptyText: { textAlign: "center", color: "gray", marginTop: 32 },
  completedHeaderText: { textAlign: "center", color: "gray", fontWeight: "bold", marginBottom: 8 },
});
