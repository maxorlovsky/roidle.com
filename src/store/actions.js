// Globals functions
import { functions } from '@src/functions.js';

export default {
    musicOff({ commit }) {
        commit('music', false);

        functions.storage('set', 'music', false);
    },
    musicOn({ commit }) {
        commit('music', true);

        functions.storage('set', 'music', true);
    },
    changeMusicVolume({ commit }, value) {
        commit('musicVolume', value);

        functions.storage('set', 'musicVolume', value);
    },
    soundOff({ commit }) {
        commit('sound', false);

        functions.storage('set', 'sound', false);
    },
    soundOn({ commit }) {
        commit('sound', true);

        functions.storage('set', 'sound', true);
    },
    changeSoundVolume({ commit }, value) {
        commit('soundVolume', value);

        functions.storage('set', 'soundVolume', value);
    }
};