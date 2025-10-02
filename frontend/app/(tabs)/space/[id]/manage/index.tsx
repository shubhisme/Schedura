import { ScrollView, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';



export default function MangeSpaceScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: colors.backgroundSecondary, paddingHorizontal: 24 }}>
      <Text style={{ color: colors.text }}>Manage Space Screen</Text>
    </ScrollView>
  );
}
