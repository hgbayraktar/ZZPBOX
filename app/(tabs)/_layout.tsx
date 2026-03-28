import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="inkomsten" />
      <Tabs.Screen name="klanten" />
      <Tabs.Screen name="producten" />
      <Tabs.Screen name="facturen" />
      <Tabs.Screen name="rapportage" />
      <Tabs.Screen name="mijnbedrijf" />
      <Tabs.Screen name="instellingen" />
      <Tabs.Screen name="abonnement" />
      <Tabs.Screen name="categorieen" />
    </Tabs>
  );
}