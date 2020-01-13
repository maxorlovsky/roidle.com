// Mutations are always synchronous
export default {
    saveStats: (state, values) => {
        state.characterStats.str = values.str;
        state.characterStats.dex = values.dex;
        state.characterStats.int = values.int;
        state.characterStats.vit = values.vit;
        state.characterStats.wis = values.wis;
        state.characterStats.luk = values.luk;

        state.characterStatusPoints = values.statusPoints;
    },
    updateCharacterData: (state, character) => {
        state.characterName = character.name;
        state.gender = character.gender;
        state.characterHeadStyle = character.headStyle;
        state.characterStats.str = character.stats.str;
        state.characterStats.dex = character.stats.dex;
        state.characterStats.int = character.stats.int;
        state.characterStats.vit = character.stats.vit;
        state.characterStats.wis = character.stats.wis;
        state.characterStats.luk = character.stats.luk;
        state.characterStatusPoints = character.statusPoints;
    },
    saveCharacterName: (state, characterName) => {
        state.characterName = characterName;
    },
    saveCharacterStats: (state, characterStats) => {
        state.characterName = characterStats;
    },
    saveParty: (state, values) => {
        state.party = values;
    },
    displayDockedMenu: (state, values) => {
        state.dockedMenu = values;
    }
};