import { PLATFORM_NAME, Platform } from './platform.js';

export default (api) => {
    api.registerPlatform(PLATFORM_NAME, Platform);
};
