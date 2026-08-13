const LIVE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sm-bookings.onrender.com/api/v1';

const ENV = {
  dev: {
    API_URL: LIVE_API_URL,
  },
  prod: {
    API_URL: LIVE_API_URL,
  },
};

const getEnvVars = () => {
  return ENV.prod;
};

export default getEnvVars();
