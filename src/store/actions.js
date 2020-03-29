// Globals functions
import { functions } from '../functions.js';

export default {
    updateSaveLocation: ({ commit }, locationId) => {
        const character = functions.storage('get', 'character');

        character.saveLocation = locationId;

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('setCharacterData', character);
    }
};