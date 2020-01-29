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
    updateExp: ({ commit }, values) => {
        // Persisting save of user new stats
        const character = functions.storage('get', 'character');

        if (values.baseExp) {
            character.baseExp = values.baseExp;
        }

        if (values.jobExp) {
            character.jobExp = values.jobExp;
        }

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('saveExp', values);
    },
    levelUpJob: ({ commit }, values) => {
        // Persisting save of user new stats
        const character = functions.storage('get', 'character');

        if (values.jobLevel) {
            character.jobLevel = values.jobLevel;
        }

        if (values.jobExp) {
            character.jobExp = values.jobExp;
        }

        character.skillPoints = values.skillPoints;

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('saveSkillPoints', character.skillPoints);
        commit('saveLevels', values);
        commit('saveExp', values);
    },
    levelUpBase: ({ commit }, values) => {
        // Persisting save of user new stats
        const character = functions.storage('get', 'character');

        if (values.baseLevel) {
            character.baseLevel = values.baseLevel;
        }

        if (values.baseExp) {
            character.baseExp = values.baseExp;
        }

        character.statusPoints = values.statusPoints;

        functions.storage('set', 'character', character, 604800000 * 90);

        commit('saveStatusPoints', character.statusPoints);
        commit('saveLevels', values);
        commit('saveExp', values);
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