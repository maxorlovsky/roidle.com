// Vue
import Vue from 'vue';

// Mutations are always synchronous
export default {
    allMaps: (state, value) => {
        state.allMaps = value;
    },
    socketConnection: (state, value) => {
        state.socketConnection = value;
    },
    showChat: (state, value) => {
        state.showChat = value;
    },
    setHpMp: (state, values) => {
        if (values.hp) {
            state.characterHp = values.hp;
        }

        if (values.mp) {
            state.characterMp = values.mp;
        }
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

        if (values.baseExpPercentage) {
            state.characterBaseExpPercentage = values.baseExpPercentage;
        }

        if (values.jobExpPercentage) {
            state.characterJobExpPercentage = values.jobExpPercentage;
        }
    },
    sendChat: (state, values) => {
        state.chatContent = values;
    },
    huntStatus: (state, value) => {
        state.huntStatus = value.status;
        state.huntEndTimer = value.timeFinish;
    },
    saveZeny: (state, zeny) => {
        state.characterZeny = zeny;
    },
    saveLocation: (state, values) => {
        state.characterLocationId = values.locationId;
        state.characterLocation = values.location;

        // Reset traveling state
        state.travelingToLocation = 0;
        state.travelingToLocationName = '';
        state.travelingArrivalTime = 0;
    },
    saveTraveling: (state, values) => {
        state.travelingToLocation = values.locationId;
        state.travelingToLocationName = values.locationName;
        state.travelingArrivalTime = values.time;
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
        if (values.baseExpPercentage) {
            state.characterBaseExpPercentage = values.baseExpPercentage;
        }
        if (values.jobExpPercentage) {
            state.characterJobExpPercentage = values.jobExpPercentage;
        }

        // Stats
        const characterStats = {
            str: state.characterStats.str,
            dex: state.characterStats.dex,
            int: state.characterStats.int,
            vit: state.characterStats.vit,
            wis: state.characterStats.wis,
            luk: state.characterStats.luk
        };

        if (values.stats && values.stats.str) {
            characterStats.str = values.stats.str;
        }
        if (values.stats && values.stats.dex) {
            characterStats.dex = values.stats.dex;
        }
        if (values.stats && values.stats.int) {
            characterStats.int = values.stats.int;
        }
        if (values.stats && values.stats.vit) {
            characterStats.vit = values.stats.vit;
        }
        if (values.stats && values.stats.wis) {
            characterStats.wis = values.stats.wis;
        }
        if (values.stats && values.stats.luk) {
            characterStats.luk = values.stats.luk;
        }
        if (values.statusPoints || values.statusPoints === 0) {
            state.characterStatusPoints = values.statusPoints;
        }

        Vue.set(state, 'characterStats', characterStats);

        // Bonus stats
        const characterBonusStats = {
            str: state.characterBonusStats.str,
            dex: state.characterBonusStats.dex,
            int: state.characterBonusStats.int,
            vit: state.characterBonusStats.vit,
            wis: state.characterBonusStats.wis,
            luk: state.characterBonusStats.luk,
            patk: state.characterBonusStats.patk,
            pdef: state.characterBonusStats.pdef,
            matk: state.characterBonusStats.matk,
            mdef: state.characterBonusStats.mdef,
            hp: state.characterBonusStats.hp,
            mp: state.characterBonusStats.mp,
            hit: state.characterBonusStats.hit,
            eva: state.characterBonusStats.eva
        };

        if (values.bonusStats && values.bonusStats.str) {
            characterBonusStats.str = values.bonusStats.str;
        }
        if (values.bonusStats && values.bonusStats.dex) {
            characterBonusStats.dex = values.bonusStats.dex;
        }
        if (values.bonusStats && values.bonusStats.int) {
            characterBonusStats.int = values.bonusStats.int;
        }
        if (values.bonusStats && values.bonusStats.vit) {
            characterBonusStats.vit = values.bonusStats.vit;
        }
        if (values.bonusStats && values.bonusStats.wis) {
            characterBonusStats.wis = values.bonusStats.wis;
        }
        if (values.bonusStats && values.bonusStats.luk) {
            characterBonusStats.luk = values.bonusStats.luk;
        }
        if (values.bonusStats && values.bonusStats.patk) {
            characterBonusStats.patk = values.bonusStats.patk;
        }
        if (values.bonusStats && values.bonusStats.matk) {
            characterBonusStats.matk = values.bonusStats.matk;
        }
        if (values.bonusStats && values.bonusStats.pdef) {
            characterBonusStats.pdef = values.bonusStats.pdef;
        }
        if (values.bonusStats && values.bonusStats.mdef) {
            characterBonusStats.mdef = values.bonusStats.mdef;
        }
        if (values.bonusStats && values.bonusStats.hit) {
            characterBonusStats.hit = values.bonusStats.hit;
        }
        if (values.bonusStats && values.bonusStats.eva) {
            characterBonusStats.eva = values.bonusStats.eva;
        }
        if (values.bonusStats && values.bonusStats.maxHp) {
            characterBonusStats.maxHp = values.bonusStats.maxHp;
        }
        if (values.bonusStats && values.bonusStats.maxMp) {
            characterBonusStats.maxMp = values.bonusStats.maxMp;
        }

        Vue.set(state, 'characterBonusStats', characterBonusStats);

        // Attributes
        const characterAttributes = {
            patk: state.characterAttributes.patk,
            pdef: state.characterAttributes.pdef,
            matk: state.characterAttributes.matk,
            mdef: state.characterAttributes.mdef,
            maxHp: state.characterAttributes.maxHp,
            maxMp: state.characterAttributes.maxMp,
            hit: state.characterAttributes.hit,
            eva: state.characterAttributes.eva,
            speed: state.characterAttributes.speed,
            weight: state.characterAttributes.weight
        };

        if (values.attributes && values.attributes.patk) {
            characterAttributes.patk = values.attributes.patk;
        }
        if (values.attributes && values.attributes.matk) {
            characterAttributes.matk = values.attributes.matk;
        }
        if (values.attributes && values.attributes.pdef) {
            characterAttributes.pdef = values.attributes.pdef;
        }
        if (values.attributes && values.attributes.mdef) {
            characterAttributes.mdef = values.attributes.mdef;
        }
        if (values.attributes && values.attributes.hit) {
            characterAttributes.hit = values.attributes.hit;
        }
        if (values.attributes && values.attributes.eva) {
            characterAttributes.eva = values.attributes.eva;
        }
        if (values.attributes && values.attributes.speed) {
            characterAttributes.speed = values.attributes.speed || 0;
        }
        if (values.attributes && values.attributes.maxHp) {
            characterAttributes.maxHp = values.attributes.maxHp;
        }
        if (values.attributes && values.attributes.maxMp) {
            characterAttributes.maxMp = values.attributes.maxMp;
        }
        if (values.attributes && values.attributes.weight) {
            characterAttributes.weight = values.attributes.weight;
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
        if (values.locationId) {
            state.characterLocationId = values.locationId;
        }
        if (values.location) {
            state.characterLocation = values.location;
        }
        if (values.saveLocationId) {
            state.characterSaveLocationId = values.saveLocationId;
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
        state.characterBaseExpPercentage = values.character.baseExpPercentage;
        state.characterJobExpPercentage = values.character.jobExpPercentage;
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

        // Traveling
        if (values.traveling.traveling) {
            state.travelingToLocation = values.traveling.travelingId;
            state.travelingToLocationName = values.traveling.travelingName;
            state.travelingArrivalTime = values.traveling.arrivalTime;
        }

        // Resting
        if (values.restingTime) {
            state.restInProgress = values.restingTime;
        }
    },
    displayDockedMenu: (state, values) => {
        state.dockedMenu = values;
    },
    itemInfoInventoryPage: (state) => {
        state.selfBagItemInfo = true;
    },
    closeItemInfo: (state) => {
        state.selfBagItemInfo = false;
        state.closeItemInfo = new Date();
    }
};