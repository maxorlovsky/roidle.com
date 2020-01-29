// Vue
import Vue from 'vue';

// Mutations are always synchronous
export default {
    socketConnection: (state, value) => {
        state.socketConnection = value;
    },
    showChat: (state, value) => {
        state.showChat = value;
    },
    setBonusStats: (state, values) => {
        state.bonusStats.str = values.str;
        state.bonusStats.dex = values.dex;
        state.bonusStats.int = values.int;
        state.bonusStats.vit = values.vit;
        state.bonusStats.wis = values.wis;
        state.bonusStats.luk = values.luk;
        state.bonusStats.patk = values.patk;
        state.bonusStats.pdef = values.pdef;
        state.bonusStats.matk = values.matk;
        state.bonusStats.mdef = values.mdef;
        state.bonusStats.hp = values.hp;
        state.bonusStats.mp = values.mp;
        state.bonusStats.hit = values.hit;
        state.bonusStats.eva = values.eva;
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
    // New socket implementation
    setEquipment: (state, equipment) => {
        state.characterEquipment = equipment;

        Vue.set(state, 'characterEquipment', equipment);
    },
    setInventoryData: (state, value) => {
        state.inventory = value.inventory;

        if (value.inventoryWeight) {
            state.inventoryWeight = value.inventoryWeight;
        }
    },
    setCharacterData: (state, values) => {
        // Main character data
        if (values.name) {
            state.characterName = values.name;
        }
        if (values.gender) {
            state.characterGender = values.gender;
        }
        if (values.headStyle) {
            state.characterHeadStyle = values.headStyle;
        }

        // Char params
        if (values.baseLevel) {
            state.characterBaseLevel = values.baseLevel;
        }
        if (values.jobLevel) {
            state.characterJobLevel = values.jobLevel;
        }
        if (values.baseExp) {
            state.characterBaseExp = values.baseExp;
        }
        if (values.jobExp) {
            state.characterJobExp = values.jobExp;
        }
        if (values.jobId) {
            state.characterJobId = values.jobId;
        }

        // Stats
        let statsTrigger = false;

        if (values.stats && values.stats.str) {
            state.characterStats.str = values.stats.str;
            statsTrigger = true;
        }
        if (values.stats && values.stats.dex) {
            state.characterStats.dex = values.stats.dex;
            statsTrigger = true;
        }
        if (values.stats && values.stats.int) {
            state.characterStats.int = values.stats.int;
            statsTrigger = true;
        }
        if (values.stats && values.stats.vit) {
            state.characterStats.vit = values.stats.vit;
            statsTrigger = true;
        }
        if (values.stats && values.stats.wis) {
            state.characterStats.wis = values.stats.wis;
            statsTrigger = true;
        }
        if (values.stats && values.stats.luk) {
            state.characterStats.luk = values.stats.luk;
            statsTrigger = true;
        }
        if (values.statusPoints) {
            state.characterStatusPoints = values.statusPoints;
        }

        // Bonus stats
        if (values.bonusStats && values.bonusStats.str) {
            state.characterBonusStats.str = values.bonusStats.str;
            statsTrigger = true;
        }
        if (values.bonusStats && values.bonusStats.dex) {
            state.characterBonusStats.dex = values.bonusStats.dex;
            statsTrigger = true;
        }
        if (values.bonusStats && values.bonusStats.int) {
            state.characterBonusStats.int = values.bonusStats.int;
            statsTrigger = true;
        }
        if (values.bonusStats && values.bonusStats.vit) {
            state.characterBonusStats.vit = values.bonusStats.vit;
            statsTrigger = true;
        }
        if (values.bonusStats && values.bonusStats.wis) {
            state.characterBonusStats.wis = values.bonusStats.wis;
            statsTrigger = true;
        }
        if (values.bonusStats && values.bonusStats.luk) {
            state.characterBonusStats.luk = values.bonusStats.luk;
            statsTrigger = true;
        }

        // Attributes
        const characterAttributes = {};

        if (values.attributes && values.attributes.patk) {
            characterAttributes.patk = values.attributes.patk;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.matk) {
            characterAttributes.matk = values.attributes.matk;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.pdef) {
            characterAttributes.pdef = values.attributes.pdef;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.mdef) {
            characterAttributes.mdef = values.attributes.mdef;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.hit) {
            characterAttributes.hit = values.attributes.hit;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.eva) {
            characterAttributes.eva = values.attributes.eva;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.speed) {
            characterAttributes.speed = values.attributes.speed;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.maxHp) {
            characterAttributes.maxHp = values.attributes.maxHp;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.maxMp) {
            characterAttributes.maxMp = values.attributes.maxMp;
            statsTrigger = true;
        }
        if (values.attributes && values.attributes.weight) {
            characterAttributes.weight = values.attributes.weight;
            statsTrigger = true;
        }
        Vue.set(state, 'characterAttributes', characterAttributes);

        // Skills
        if (values.skills) {
            state.characterSkills = values.skills;
        }
        if (values.skillPoints) {
            state.characterSkillPoints = values.skillPoints;
        }

        // Location
        if (values.location) {
            state.characterLocation = values.location;
        }
        if (values.saveLocation) {
            state.characterSaveLocation = values.saveLocation;
        }

        // Hp/Mp
        if (values.hp) {
            state.characterHp = values.hp;
        }
        if (values.mp) {
            state.characterMp = values.mp;
        }

        // Zeny
        if (values.zeny) {
            state.characterZeny = values.zeny;
        }

        // Equipment
        if (values.equipment && values.equipment.head) {
            state.characterEquipment.head.itemId = values.equipment.head.itemId || 0;
            state.characterEquipment.head.name = values.equipment.head.name || '';
            state.characterEquipment.head.refined = values.equipment.head.refined || 0;
        }
        if (values.equipment && values.equipment.rhand) {
            state.characterEquipment.rhand.itemId = values.equipment.rhand.itemId || 0;
            state.characterEquipment.rhand.name = values.equipment.rhand.name || '';
            state.characterEquipment.rhand.refined = values.equipment.rhand.refined || 0;
        }
        if (values.equipment && values.equipment.garment) {
            state.characterEquipment.garment.itemId = values.equipment.garment.itemId || 0;
            state.characterEquipment.garment.name = values.equipment.garment.name || '';
            state.characterEquipment.garment.refined = values.equipment.garment.refined || 0;
        }
        if (values.equipment && values.equipment.body) {
            state.characterEquipment.body.itemId = values.equipment.body.itemId || 0;
            state.characterEquipment.body.name = values.equipment.body.name || '';
            state.characterEquipment.body.refined = values.equipment.body.refined || 0;
        }
        if (values.equipment && values.equipment.lhand) {
            state.characterEquipment.lhand.itemId = values.equipment.lhand.itemId || 0;
            state.characterEquipment.lhand.name = values.equipment.lhand.name || '';
            state.characterEquipment.lhand.refined = values.equipment.lhand.refined || 0;
        }
        if (values.equipment && values.equipment.footgear) {
            state.characterEquipment.footgear.itemId = values.equipment.footgear.itemId || 0;
            state.characterEquipment.footgear.name = values.equipment.footgear.name || '';
            state.characterEquipment.footgear.refined = values.equipment.footgear.refined || 0;
        }

        if (statsTrigger) {
            state.characterStatsTrigger = new Date();
        }
    },
    characterInit: (state, values) => {
        // Main character data
        state.characterId = values.character.id;
        state.characterName = values.character.name;
        state.characterGender = values.character.gender;
        state.characterHeadStyle = values.character.headStyle;
        state.characterBaseLevel = values.character.baseLevel;
        state.characterJobLevel = values.character.jobLevel;
        state.characterBaseExp = values.character.baseExp;
        state.characterJobExp = values.character.jobExp;
        state.characterJobId = values.character.jobId;
        state.characterJob = values.character.job;
        state.characterStatusPoints = values.character.statusPoints;
        state.characterSkillPoints = values.character.skillPoints;

        state.characterLocationId = values.character.locationId;
        state.characterLocation = values.character.location;
        state.characterSaveLocationId = values.character.saveLocationId;
        state.characterSaveLocation = values.character.saveLocation;
        state.characterHp = values.character.hp;
        state.characterMp = values.character.mp;
        state.characterZeny = values.character.zeny;

        // Stats
        state.characterStats.str = values.stats.stats.str;
        state.characterStats.dex = values.stats.stats.dex;
        state.characterStats.int = values.stats.stats.int;
        state.characterStats.vit = values.stats.stats.vit;
        state.characterStats.wis = values.stats.stats.wis;
        state.characterStats.luk = values.stats.stats.luk;

        // Bonus stats
        state.characterBonusStats.str = values.stats.bonusStats.str;
        state.characterBonusStats.dex = values.stats.bonusStats.dex;
        state.characterBonusStats.int = values.stats.bonusStats.int;
        state.characterBonusStats.vit = values.stats.bonusStats.vit;
        state.characterBonusStats.wis = values.stats.bonusStats.wis;
        state.characterBonusStats.luk = values.stats.bonusStats.luk;
        state.characterBonusStats.patk = values.stats.bonusStats.patk;
        state.characterBonusStats.pdef = values.stats.bonusStats.pdef;
        state.characterBonusStats.matk = values.stats.bonusStats.matk;
        state.characterBonusStats.mdef = values.stats.bonusStats.mdef;
        state.characterBonusStats.hp = values.stats.bonusStats.hp;
        state.characterBonusStats.mp = values.stats.bonusStats.mp;
        state.characterBonusStats.hit = values.stats.bonusStats.hit;
        state.characterBonusStats.eva = values.stats.bonusStats.eva;

        // Attributes
        state.characterAttributes.patk = values.stats.attributes.patk;
        state.characterAttributes.matk = values.stats.attributes.matk;
        state.characterAttributes.pdef = values.stats.attributes.pdef;
        state.characterAttributes.mdef = values.stats.attributes.mdef;
        state.characterAttributes.hit = values.stats.attributes.hit;
        state.characterAttributes.eva = values.stats.attributes.eva;
        state.characterAttributes.speed = values.stats.attributes.speed;
        state.characterAttributes.maxHp = values.stats.attributes.maxHp;
        state.characterAttributes.maxMp = values.stats.attributes.maxMp;
        state.characterAttributes.weight = values.stats.attributes.weight;

        // Skills
        state.characterSkills = values.skills;

        // Inventory
        state.inventory = values.inventory;
        state.inventoryWeight = values.inventoryWeight;

        if (values.equipment && values.equipment.head) {
            state.characterEquipment.head.itemId = values.equipment.head.itemId || 0;
            state.characterEquipment.head.name = values.equipment.head.name || '';
            state.characterEquipment.head.refined = values.equipment.head.refined || 0;
        }
        if (values.equipment && values.equipment.rhand) {
            state.characterEquipment.rhand.itemId = values.equipment.rhand.itemId || 0;
            state.characterEquipment.rhand.name = values.equipment.rhand.name || '';
            state.characterEquipment.rhand.refined = values.equipment.rhand.refined || 0;
        }
        if (values.equipment && values.equipment.garment) {
            state.characterEquipment.garment.itemId = values.equipment.garment.itemId || 0;
            state.characterEquipment.garment.name = values.equipment.garment.name || '';
            state.characterEquipment.garment.refined = values.equipment.garment.refined || 0;
        }
        if (values.equipment && values.equipment.body) {
            state.characterEquipment.body.itemId = values.equipment.body.itemId || 0;
            state.characterEquipment.body.name = values.equipment.body.name || '';
            state.characterEquipment.body.refined = values.equipment.body.refined || 0;
        }
        if (values.equipment && values.equipment.lhand) {
            state.characterEquipment.lhand.itemId = values.equipment.lhand.itemId || 0;
            state.characterEquipment.lhand.name = values.equipment.lhand.name || '';
            state.characterEquipment.lhand.refined = values.equipment.lhand.refined || 0;
        }
        if (values.equipment && values.equipment.footgear) {
            state.characterEquipment.footgear.itemId = values.equipment.footgear.itemId || 0;
            state.characterEquipment.footgear.name = values.equipment.footgear.name || '';
            state.characterEquipment.footgear.refined = values.equipment.footgear.refined || 0;
        }
    },
    displayDockedMenu: (state, values) => {
        state.dockedMenu = values;
    }
};