// Globals functions
import { functions } from '../functions.js';

export default {
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
    },
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