// Globals functions
import { functions } from './functions.js';

// Vue
import Vue from 'vue';
import VueI18n from 'vue-i18n';

import App from './app.vue';

// Pages
import './pages/character/character.vue';
import './pages/character/character-skills.vue';
import './pages/game/game.vue';
import './pages/inventory/inventory.vue';
import './pages/home/home.vue';
import './pages/map/map.vue';
import './pages/missions/missions.vue';
import './pages/server-down/server-down.vue';
import './pages/shop/shop.vue';
// Mixins
// 1 import globalMixins from '@shared/fe-utilities/src/mixins/global-mixin.js';

// Router
import router from './router.js';

// Number formats definitions based on locale
/* 1 import { numberFormats } from './config/i18n/number-formats.js';
import messages from './config/i18n/messages.js'; */

// Destroying old cache
functions.storageCacheBuster();

Vue.use(VueI18n);

// Check if there is a token
if (functions.storage('get', 'token')) {
    // Specifying as loggedIn, to check info in router beforeEach
    mo.loggedIn = true;
}

/* Retrieve the locale from the browser
 * Extract language (first two letters) from the locale
 * Due to inconsistency of locale format in different browsers
 */
// 1 const browserLocale = navigator.language.substring(0, 2);

/* 1 const i18n = new VueI18n({
    locale: browserLocale,
    messages: messages,
    numberFormats: numberFormats
}); */

mo.app = new Vue({
    // 1i18n,
    router: router,
    render: (h) => h(App)
}).$mount('#app');