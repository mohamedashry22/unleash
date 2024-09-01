require('dotenv').config();
const { initialize } = require('unleash-client');

const isDevelopment = process.env.NODE_ENV === 'development';

const client = initialize({
  appName: 'test-app',
  url: isDevelopment ? process.env.DEV_UNLEASH_URL : process.env.PROD_UNLEASH_URL,
  refreshInterval: 10000,
  metricsInterval: 10000,
  environment: 'development',
  customHeaders: {
    Authorization: process.env.API_KEY,
  },
});

client.on('error', console.error);
client.on('warn', console.log);

async function checkFeatureFlags() {
  await new Promise(resolve => client.on('ready', resolve));

  const contexts = [
    { country: 'DE' },
    { country: 'IE' },
    { country: 'IT' }
  ].map(countryContext => ({
    ...countryContext,
    userId: `${Math.random() * 100}`,
    sessionId: Math.round(Math.random() * 1000),
    remoteAddress: '127.0.0.1',
    environment: 'development',
  }));

  const toggleName = 'device-check-api';
  contexts.forEach(context => {
    console.log(`${toggleName} enabled for ${context.country}: ${client.isEnabled(toggleName, context)}`);
  });

  console.log('----------------------------------');
  const featureFlagsdependOnToggles = client.getFeatureToggleDefinitions().filter(toggle =>
    client.isEnabled(toggle.name, contexts[2])
  );
  console.log(featureFlagsdependOnToggles);
}

checkFeatureFlags().catch(console.error);