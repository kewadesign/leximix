import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leximix.app',
  appName: 'LexiMix',
  webDir: 'dist',
  server: {
    url: 'http://s1073751747.online.de',
    cleartext: true
  }
};

export default config;
