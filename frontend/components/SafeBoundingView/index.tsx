
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PropsWithChildren } from 'react';


export default function SafeBoundingView(props:PropsWithChildren | any) {
    const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={{ marginBottom: insets.bottom }} {...props}>
     {props.children}
    </SafeAreaView>
  );
}
