import { Text, View } from 'react-native';

// Minimal stand-in for react-native-reanimated: enough for components that only animate
// a style. The real library needs native worklets, which don't exist under Jest.
export default { Text, View };
export const useSharedValue = (value: unknown) => ({ value });
export const useAnimatedStyle = (factory: () => unknown) => factory();
export const withTiming = (value: unknown) => value;
export const interpolate = (_value: number, _input: number[], output: number[]) => output[0];
