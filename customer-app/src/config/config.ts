const ENV = {
  dev: {
    // For Android Emulator to access localhost, use 10.0.2.2.
    // For iOS Simulator, localhost works.
    // Replace with your local machine's IP address if testing on physical devices.
    API_URL: 'http://10.0.2.2:8080/api/v1',
  },
  prod: {
    // You can set this variable before running eas build:
    // EXPO_PUBLIC_API_URL=https://api.mysalon.com/api/v1 eas build
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.mysalon.com/api/v1',
  },
};

const getEnvVars = () => {
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars();
