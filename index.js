import { AppRegistry } from 'react-native';
import App from './App.js';

const appName = 'NovaGrandPro';

// Register for standard Bare React Native CLI
AppRegistry.registerComponent(appName, () => App);

// Also register as 'main' for compatibility with generic bundlers
AppRegistry.registerComponent('main', () => App);

