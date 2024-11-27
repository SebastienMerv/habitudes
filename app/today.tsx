import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, Checkbox, Divider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TodayScreen() {
  const [habits, setHabits] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);

useEffect(() => {
  const loadHabits = async () => {
    const storedHabits = await AsyncStorage.getItem("habits");
    if (storedHabits) {
      const allHabits = JSON.parse(storedHabits);
      filterTodayHabits(allHabits); 
    }
  };

  const interval = setInterval(() => {
    loadHabits();
  }, 500); 

  return () => clearInterval(interval);
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
    filterTodayHabits(updatedHabits);
    saveHabits(updatedHabits);
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

    const sorted = [...filtered].sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(":").map(Number);
      const [bHours, bMinutes] = b.time.split(":").map(Number);
  
      return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
    });
  
    setTodayHabits(sorted);
  };
  

  // Rendu d'une habitude
  const renderHabit = ({ item }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.cardContent}>
        <Checkbox
          status={item.completed ? "checked" : "unchecked"}
          onPress={() => toggleHabit(item.id)}
        />
        <Text style={[styles.habitText, item.completed && styles.completedText]}>
          {item.title} ({item.time + 'h'})
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.headerText}>
        Habitudes du Jour
      </Text>
      <Text style={styles.subText}>
        Voici la liste des habitudes à accomplir aujourd’hui.
      </Text>
      <Divider style={styles.divider} />

      <FlatList
        data={todayHabits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucune habitude à afficher pour aujourd'hui. Ajoutez-en dans l'onglet "Gérer les Habitudes".
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    marginBottom: 16,
    textAlign: "center",
    color: "gray",
  },
  divider: {
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 8,
    borderRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  habitText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginTop: 32,
  },
});
