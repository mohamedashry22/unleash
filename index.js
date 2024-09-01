require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { initialize } = require('unleash-client');

const instanceId = process.env.INSTANCE_ID || uuidv4();

class FeatureStrategy {
  execute(country) {
    throw new Error('Execute method must be implemented.');
  }
}

class EnabledFeatureStrategy extends FeatureStrategy {
  execute(country) {
    console.log(`Executing feature-specific logic for country ${country}.`);
  }
}

class DisabledFeatureStrategy extends FeatureStrategy {
  execute(country) {
    console.log(`Executing fallback logic for country ${country}.`);
  }
}

class FeatureStrategyFactory {
  static create(isEnabled) {
    return isEnabled ? new EnabledFeatureStrategy() : new DisabledFeatureStrategy();
  }
}

class FeatureFlagService {
  constructor(unleashClient) {
    this.unleash = unleashClient;
  }

  async checkFeatureFlag(country) {
    const context = {
      sessionId: uuidv4(),
      country: country,
    };

    const isEnabled = this.unleash.isEnabled('device-check-api', context);
    console.log(`Feature 'device-check-api' is enabled for country ${country}: ${isEnabled}`);

    const strategy = FeatureStrategyFactory.create(isEnabled);
    strategy.execute(country);
  }
}

async function run() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const unleash = initialize({
    url: isDevelopment ? process.env.DEV_UNLEASH_URL : process.env.PROD_UNLEASH_URL,
    appName: process.env.APP_NAME,
    instanceId: instanceId,
    customHeaders: {
      Authorization: process.env.API_KEY,
    },
    environment: 'development',
    refreshInterval: isDevelopment ? 5000 : 15000,
    metricsInterval: isDevelopment ? 10000 : 60000,
  });

  unleash.on('error', (error) => {
    console.error('Error connecting to Unleash:', error);
  });

  const featureFlagService = new FeatureFlagService(unleash);

  try {
    await new Promise((resolve) => unleash.on('ready', resolve));
    await Promise.all(['DE', 'IE', 'IT'].map((country) => featureFlagService.checkFeatureFlag(country)));
  } finally {
    unleash.destroy();
    console.log('Unleash client stopped.');
  }
}

run().catch((error) => {
  console.error('Initialization error:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  try {
    await unleash.destroy();
    console.log('Unleash client stopped.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});