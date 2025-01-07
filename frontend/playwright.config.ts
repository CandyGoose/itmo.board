import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    globalSetup: require.resolve('./e2e/global-setup'),
    testMatch: '**/*.e2e.ts',
    testIgnore: '**/*.test.{ts,tsx}',
    workers: 1,
    use: {
        baseURL: 'http://localhost:3000',
        storageState: 'storageState.json',
    },
    timeout: 30000,
};

export default config;
