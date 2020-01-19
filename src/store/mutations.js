// Mutations are always synchronous
export default {
    setEquipment: (state, value) => {
        state.characterEquipmentSlots[value.slot] = value.itemId;
        state.characterEquipmentTrigger = new Date();
    },
    setHpMp: (state, values) => {
        state.characterHp = values.hp;
        state.characterMp = values.mp;
    },
    saveResting: (state, value) => {
        state.restInProgress = value;
    },
    saveSkillPoints: (state, value) => {
        state.characterSkillPoints = value;
    },
    saveStatusPoints: (state, value) => {
        state.characterStatusPoints = value;
    },
    saveLevels: (state, values) => {
        if (values.baseLevel) {
            state.characterBaseLevel = values.baseLevel;
        }

        if (values.jobLevel) {
            state.characterJobLevel = values.jobLevel;
        }
    },
    saveExp: (state, values) => {
        if (values.baseExp) {
            state.characterBaseExp = values.baseExp;
        }

        if (values.jobExp) {
            state.characterJobExp = values.jobExp;
        }
    },
    sendChat: (state, values) => {
        state.chatContent = values;
    },
    fightStatus: (state, value) => {
        state.fightStatus = value;
    },
    saveCharHp: (state, hp) => {
        state.characterHp = hp;
    },
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
    setInventoryData: (state, value) => {
        state.inventory = value;
    },
    setCharacterData: (state, values) => {
        // Main character data
        state.characterName = values.name;
        state.characterGender = values.gender;
        state.characterHeadStyle = values.headStyle;

        // Char params
        state.characterBaseLevel = values.baseLevel;
        state.characterJobLevel = values.jobLevel;
        state.characterBaseExp = values.baseExp;
        state.characterJobExp = values.jobExp;
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
        state.characterSaveLocation = values.saveLocation;

        // Hp/Mp
        state.characterHp = values.hp;
        state.characterMp = values.mp;

        // Zeny
        state.characterZeny = values.zeny;
    },
    saveParty: (state, values) => {
        state.party = values;
    },
    displayDockedMenu: (state, values) => {
        state.dockedMenu = values;
    }
};