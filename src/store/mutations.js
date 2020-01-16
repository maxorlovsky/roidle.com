// Mutations are always synchronous
export default {
    saveLocation: (state, locationId) => {
        state.characterLocation = locationId;
        state.travelingToLocation = 0;
    },
    saveTraveling: (state, values) => {
        state.travelingToLocation = values.locationId;
    },
    saveSkills: (state, values) => {
        state.characterSkills = values.skills;
        state.characterSkillPoints = values.skillPoints;
    },
    saveStats: (state, values) => {
        state.characterStats.str = values.str;
        state.characterStats.dex = values.dex;
        state.characterStats.int = values.int;
        state.characterStats.vit = values.vit;
        state.characterStats.wis = values.wis;
        state.characterStats.luk = values.luk;

        state.characterStatusPoints = values.statusPoints;
    },
    setCharacterData: (state, values) => {
        // Main character data
        state.characterName = values.name;
        state.characterGender = values.gender;
        state.characterHeadStyle = values.headStyle;

        // Char params
        state.characterBaseLevel = values.baseLevel;
        state.characterJobLevel = values.jobLevel;
        state.characterJobId = values.jobId;

        // Stats
        state.characterStats.str = values.stats.str;
        state.characterStats.dex = values.stats.dex;
        state.characterStats.int = values.stats.int;
        state.characterStats.vit = values.stats.vit;
        state.characterStats.wis = values.stats.wis;
        state.characterStats.luk = values.stats.luk;
        state.characterStatusPoints = values.statusPoints;

        // Skills
        state.characterSkillPoints = values.skillPoints;
        state.characterSkills = values.skills;

        // Location
        state.characterLocation = values.location;
    },
    saveParty: (state, values) => {
        state.party = values;
    },
    displayDockedMenu: (state, values) => {
        state.dockedMenu = values;
    }
};