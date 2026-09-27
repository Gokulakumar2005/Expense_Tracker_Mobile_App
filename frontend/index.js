import { registerRootComponent } from 'expo';
import { NativeWindStyleSheet } from 'nativewind';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

import App from './App';

registerRootComponent(App);
