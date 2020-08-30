// 3rd party libs
import * as firebase from 'firebase/app';

// Vuex
import { store } from './store/index.js';

// Plugins
import '@firebase/messaging';

firebase.initializeApp({
    apiKey: 'AIzaSyCNIDSUOTbtEPY7St8cZnXAZiKboDm8SaI',
    authDomain: 'roidle.firebaseapp.com',
    databaseURL: 'https://roidle.firebaseio.com',
    projectId: 'roidle',
    storageBucket: 'roidle.appspot.com',
    messagingSenderId: '211551723498',
    appId: '1:211551723498:web:ba831442daf7bc671d5c93'
});

const messaging = firebase.messaging();

messaging.onTokenRefresh(() => {
    messaging.getToken().then((refreshedToken) => {
        store.commit('pushToken', refreshedToken);
    });
});

const firebaseInit = {
    init: async() => {
        const registration = await navigator.serviceWorker.register('./dist/firebase-messaging-sw.js');

        messaging.useServiceWorker(registration);

        // Add the public key generated from the console here.
        messaging.usePublicVapidKey('BCoSOe_31NIHv7pXi9E43d2SKcfxUV4aO5n8Cstw0kSsKpIALCS4CHy_RSxUZaCuKop0XYLVxG5n_qJXiwvtL88');

        await firebaseInit.getToken();
    },
    getToken: async() => {
        const currentToken = await messaging.getToken();

        if (currentToken) {
            store.commit('pushToken', currentToken);
        }
    }
};

firebaseInit.init();