// Globals functions
import { functions } from '@src/functions.js';

export default {
    setPartyMembers({ commit, state }, value) {
        const members = state.partyMembers || [];

        // Check if party member that we're trying to add is already in the party, if that's the case we just run update
        for (const partyMember of value) {
            const findMemberIndex = members.findIndex((member) => member.id === partyMember.id);

            // If found we just update his data
            if (findMemberIndex >= 0) {
                members[findMemberIndex] = partyMember;
            } else {
                // In case it's a new member, we add it
                members.push(partyMember);
            }
        }

        commit('setPartyMembers', members);
    },
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