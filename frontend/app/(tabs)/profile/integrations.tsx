import React, { useState, useEffect } from "react";
import { View, Text, Switch, Linking } from "react-native";
import { useToast } from "@/components/Toast";

const BACKEND_URL = "https://schedura.onrender.com";

export default function IntegrationsPage() {
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/integrations/status`);
      const data = await res.json();
      setGoogleEnabled(data.google);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGoogleToggle = async (value: boolean) => {
    setLoading(true);
    try {
      if (value) {
        const res = await fetch(`${BACKEND_URL}/integrations/google/connect`);
        const data = await res.json();

        await Linking.openURL(data.url);
        showToast({
          type: "info",
          title: "Google Calendar",
          description:
            "Complete login in your browser, then return to this screen.",
        });

        // Optional: poll backend every few seconds until connected
        setTimeout(fetchStatus, 5000);
      } else {
        await fetch(`${BACKEND_URL}/integrations/google/disconnect`, {
          method: "POST",
        });
        setGoogleEnabled(false);
        showToast({
          type: "success",
          title: "Disconnected",
          description: "Google Calendar integration removed.",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Google Calendar",
        description: err.message || "Failed to update integration status.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-6">Integrations</Text>

      <View className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-4 flex-row items-center justify-between border border-gray-200 dark:border-slate-700">
        <View>
          <Text className="text-lg font-semibold mb-1">Google Calendar</Text>
          <Text className="text-gray-500 dark:text-gray-300 text-sm">
            Enable to add bookings/events to your Google Calendar.
          </Text>
        </View>
        <Switch
          value={googleEnabled}
          onValueChange={handleGoogleToggle}
          disabled={loading}
        />
      </View>
    </View>
  );
}
