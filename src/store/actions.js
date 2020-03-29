// Globals functions
import { functions } from '../functions.js';

export default {
    updateInventory: ({ commit }, inventory) => {
        functions.storage('set', 'inventory', inventory, 604800000 * 90);

        commit('setInventoryData', inventory);
    },
    updateZeny: ({ commit }, zeny) => {
        const character = functions.storage('get', 'character');

        character.zeny = zeny;

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('setCharacterData', character);
    },
    updateHpMp: ({ commit }, values) => {
        const character = functions.storage('get', 'character');

        if (values.hp || values.hp === 0) {
            character.hp = values.hp;
        }

        if (values.mp || values.mp === 0) {
            character.mp = values.mp;
        }

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('setHpMp', character);
    },
    updateSaveLocation: ({ commit }, locationId) => {
        const character = functions.storage('get', 'character');

        character.saveLocation = locationId;

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('setCharacterData', character);
    },
    updateLocation: ({ commit }, locationId) => {
        // Persisting save of user new stats
        const character = functions.storage('get', 'character');

        character.location = locationId;

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('saveLocation', locationId);
    },
    saveSkills: ({ commit }, values) => {
        // Persisting save of user new stats
        const character = functions.storage('get', 'character');

        character.skills = values.skills;
        character.skillPoints = values.skillPoints;

        functions.storage('set', 'character', character, 604800000 * 90);

        // Update vuex store
        commit('saveSkills', values);
    }
};