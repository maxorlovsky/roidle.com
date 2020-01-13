// Globals functions
import { functions } from '../functions.js';

export default {
    saveStats: ({ commit }, values) => {
        const stats = {
            str: values.str,
            dex: values.dex,
            int: values.int,
            vit: values.vit,
            wis: values.wis,
            luk: values.luk,
            statusPoints: values.statusPoints
        };

        // Persisting save of user new stats
        const character = functions.storage('get', 'character');

        character.stats.str = stats.str;
        character.stats.dex = stats.dex;
        character.stats.int = stats.int;
        character.stats.vit = stats.vit;
        character.stats.wis = stats.wis;
        character.stats.luk = stats.luk;
        character.statusPoints = stats.statusPoints;

        functions.storage('set', 'character', character, 604800000 * 90);

        // Update vuex store
        commit('saveStats', stats);
    }
};