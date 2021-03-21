// Utilities
import { functions } from '@utils/functions.js';

export default {
    setParty({ commit, state }, value) {
        const combinePartySkillsIds = {};

        for (const buffSkills of value.partyBuffsSkills) {
            // Looping through skills, since it's not a normal array and can't use simple contact/destruct here
            for (const [key, value] of Object.entries(buffSkills.skills)) {
                // Check if skill is already in the list and is not lower than the value of current skill
                if (!combinePartySkillsIds[key] || (combinePartySkillsIds[key] && combinePartySkillsIds[key] < value)) {
                    combinePartySkillsIds[key] = value;
                }
            }
        }

        state.partyAvailableSkillsIds = combinePartySkillsIds;

        commit('setParty', value);
    },
    puzzleChallenge({ commit }, value) {
        // In case it's a party configuration is set for party travel with leader, user will see different
        if (value.puzzleGettingSolvedByLeader) {
            commit('puzzleChallengeLeader');
        } else {
            commit('puzzleChallenge', value);
        }
    },
    removePartyMember({ commit, state }, value) {
        const members = state.partyMembers || [];
        const membersIds = state.partyMembersIds || [];

        const findPartyMemberIndex = state.partyMembers.findIndex((member) => member.id === value);
        const findPartyMemberIdIndex = state.partyMembersIds.findIndex((member) => member.id === value);

        if (findPartyMemberIndex) {
            members.splice(findPartyMemberIndex, 1);
            membersIds.splice(findPartyMemberIdIndex, 1);
        }

        commit('setPartyMembers', members);
        commit('setPartyMembersIds', membersIds);
    },
    setPartyMembers({ commit, state }, value) {
        const members = state.partyMembers || [];
        const membersIds = state.partyMembersIds || [];

        // Check if party member that we're trying to add is already in the party, if that's the case we just run update
        for (const partyMember of value) {
            const findMemberIndex = members.findIndex((member) => member.id === partyMember.id);

            // If found we just update his data
            if (findMemberIndex >= 0) {
                members[findMemberIndex] = partyMember;
            } else {
                // In case it's a new member, we add it
                members.push(partyMember);
                membersIds.push(partyMember.id);
            }
        }

        commit('setPartyMembers', members);
        commit('setPartyMembersIds', membersIds);
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