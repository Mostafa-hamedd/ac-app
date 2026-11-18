// Stand-in for @gorhom/bottom-sheet in tests: the real one needs native gesture handling and
// reanimated. Sheets render their content in place, always open. A test that needs to drive a
// sheet (present / dismiss) can still define its own jest.mock for the package.
import { FlatList, ScrollView, TextInput, View } from 'react-native';

type WithChildren = { children?: React.ReactNode };

const Passthrough = ({ children }: WithChildren) => <View>{children}</View>;

export const BottomSheetModal = Passthrough;
export const BottomSheet = Passthrough;
export const BottomSheetView = View;
export const BottomSheetModalProvider = Passthrough;
export const BottomSheetBackdrop = () => null;
export const BottomSheetScrollView = ScrollView;
export const BottomSheetFlatList = FlatList;
export const BottomSheetTextInput = TextInput;
