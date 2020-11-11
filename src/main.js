// 3rd party libs
import Vue from 'vue';

// Globals functions
import { functions } from './functions.js';

import App from './app.vue';
import './firebase.js';

// Pages
import './pages/barber-services/barber-services.vue';
import './pages/character/character.vue';
import './pages/character/character-skills.vue';
import './pages/game/game.vue';
import './pages/inventory/inventory.vue';
import './pages/home/home.vue';
import './pages/map/map.vue';
import './pages/quests/quests.vue';
import './pages/server-down/server-down.vue';
import './pages/shop/shop.vue';
import './pages/kafra-storage/kafra-storage.vue';
import './pages/settings/settings.vue';
import './pages/party/party.vue';
import './pages/profile/profile.vue';
import './pages/hunt-configuration/hunt-configuration.vue';
import './pages/trading/trading.vue';
import './pages/trading-list/trading-list.vue';
import './pages/repair/repair.vue';
import './pages/craft/craft.vue';
import './pages/craft/craft-type.vue';
import './pages/craft/craft-item.vue';
import './pages/players-shops/players-shops.vue';
import './pages/players-shops/players-shops-open.vue';
import './pages/players-shops/players-shops-view.vue';
import './pages/players-shops/players-shops-manage.vue';

// Router
import router from './router.js';

// Destroying old cache
functions.storageCacheBuster();

/* Retrieve the locale from the browser
 * Extract language (first two letters) from the locale
 * Due to inconsistency of locale format in different browsers
 */
// 1 const browserLocale = navigator.language.substring(0, 2);

mo.app = new Vue({
    router: router,
    render: (h) => h(App)
}).$mount('#app');