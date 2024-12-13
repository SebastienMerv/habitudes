import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6200ee", // Couleur principale (Material You)
    secondary: "#03dac6", // Couleur secondaire
    background: "#ffffff", // Fond de l'application
  },
};

export default function Layout() {
  return (
    <PaperProvider theme={theme}>
      <Tabs
        screenOptions={{
          headerShown: false, // Supprime le header global
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarActiveTintColor: theme.colors.primary, // Couleur active
          tabBarInactiveTintColor: "#a1a1a1", // Couleur inactive
          tabBarLabelStyle: { fontSize: 12 }, // Style des textes des onglets
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Habitudes du Jour",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="calendar-today" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="manage"
          options={{
            title: "Gérer les Habitudes",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cog-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}
