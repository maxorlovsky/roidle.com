// Globals functions
import { functions } from './functions.js';

// Vue
import Vue from 'vue';
import VueI18n from 'vue-i18n';

import App from './app.vue';

/* eslint-disable */
// Pages
import homePage from './pages/home/home.vue';
/* import dashboardPage from './pages/dashboard/dashboard.vue';
import settingsPage from './pages/settings/settings.vue';
import notFoundPage from './pages/not-found/not-found.vue';
import surveyFormPage from './pages/survey/survey-form.vue';
import partnersPage from './pages/partners/partners.vue';
import partnerFormPage from './pages/partner/partner-form.vue';
import partnerProfilePage from './pages/partner/partner-profile.vue'; */
// Mixins
//import globalMixins from '@shared/fe-utilities/src/mixins/global-mixin.js';

// Router
import router from './router.js';
/* eslint-enable */

// Number formats definitions based on locale
/* import { numberFormats } from './config/i18n/number-formats.js';
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
// const browserLocale = navigator.language.substring(0, 2);

/* const i18n = new VueI18n({
    locale: browserLocale,
    messages: messages,
    numberFormats: numberFormats
}); */

mo.app = new Vue({
    // 1i18n,
    router: router,
    render: (h) => h(App)
}).$mount('#app');