require('dotenv').config();
const { initialize, isEnabled } = require('unleash-client');

const isDevelopment = process.env.NODE_ENV === 'development';

const client = initialize({
  appName: 'test-app',
  url:  isDevelopment ? process.env.DEV_UNLEASH_URL : process.env.PROD_UNLEASH_URL,
  refreshInterval: 10000,
  metricsInterval: 10000,
  environment: 'development',
  customHeaders: {
    Authorization: process.env.API_KEY,
  },
});

client.on('error', console.error);
client.on('warn', console.log);


setTimeout(() => {
  const context = {
    userId: `${Math.random() * 100}`,
    sessionId: Math.round(Math.random() * 1000),
    remoteAddress: '127.0.0.1',
    environment: 'development',
    country: 'DE'
  };
  const context2 = {
    userId: `${Math.random() * 100}`,
    sessionId: Math.round(Math.random() * 1000),
    remoteAddress: '127.0.0.1',
    environment: 'development',
    country: 'IE'
  };
  const context3 = {
    userId: `${Math.random() * 100}`,
    sessionId: Math.round(Math.random() * 1000),
    remoteAddress: '127.0.0.1',
    environment: 'development',
    country: 'IT'
  };
  const toggleName = 'device-check-api';
  console.log(`${toggleName} enabled for DE: ${isEnabled(toggleName, context)}`);
  console.log(`${toggleName} enabled for IE: ${isEnabled(toggleName, context2)}`);
  console.log(`${toggleName} enabled for IT: ${isEnabled(toggleName, context3)}`);
  console.log('----------------------------------');
  const featureFlagsdependOnToggles = client.getFeatureToggleDefinitions().filter(toggle => 
    isEnabled(toggle.name, context3)
  );
  console.log(featureFlagsdependOnToggles);
}, 1000);

