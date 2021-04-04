// Vue
import Vue from 'vue';

// Mutations are always synchronous
export default {
    setOnline: (state, value) => {
        state.online = value.online;
        state.hunts = value.hunts;
        state.playersRegistered = value.registered;
    },
    putIntoChat: (state, value) => {
        state.putIntoChat = value;
    },
    setPreloadedData: (state, value) => {
        state.allSkillsNames = value.skillsNames;
        state.allItemsNames = value.itemsNames;
    },
    setHuntField: (state, value) => {
        state.huntField = value;
    },
    clearHuntField: (state) => {
        state.huntField = null;
    },
    setAttributesComponents: (state, value) => {
        state.attributesComponents = value;
    },
    closeSkillInfo: (state) => {
        state.closeSkillInfo = new Date();
    },
    gameModal: (state, value) => {
        state.gameModal = value;
    },
    restingComplete: (state) => {
        state.restTimer = null;
        state.characterResting = false;
    },
    restInProgress: (state, value) => {
        state.restTimer = value.finishTime;
        state.characterResting = true;
    },
    restStart: (state) => {
        state.characterResting = true;
    },
    serverUrl: (state, value) => {
        state.serverUrl = value;
    },
    publicItemInfo: (state, value) => {
        state.publicItemInfo = value;
    },
    travelingComplete: (state) => {
        state.travelTimer = null;
        state.travelData = {
            locationId: 0,
            name: 0
        };
        state.characterTraveling = false;
        state.travelingDungeon = false;
    },
    travelInProgress: (state, value) => {
        state.travelTimer = value.finishTime;
        state.travelData = {
            locationId: value.travelData.locationId,
            name: value.travelData.name
        };
        state.characterTraveling = true;
    },
    travelStart: (state) => {
        state.characterTraveling = true;
    },
    craftingComplete: (state) => {
        state.craftTimer = null;
        state.craftData = null;
        state.characterCrafting = false;
    },
    craftInProgress: (state, value) => {
        state.craftTimer = value.finishTime;
        state.craftData = value.craftData;
        state.characterCrafting = true;
    },
    craftStart: (state) => {
        state.characterCrafting = true;
    },
    tradeRequest: (state, value) => {
        state.tradeRequestId = value.id;
        state.tradeRequestName = value.name;
    },
    puzzleChallengeReset: (state) => {
        state.puzzleChallenge = null;
        state.puzzleChallengeNr = null;
        state.puzzleChallengeLeader = null;
    },
    puzzleChallenge: (state, value) => {
        state.puzzleChallenge = value.puzzleText;
        state.puzzleChallengeNr = value.puzzleNr;
    },
    puzzleChallengeLeader: (state) => {
        state.puzzleChallengeLeader = true;
        state.puzzleChallenge = 'on';
    },
    currentLocation: (state, value) => {
        state.currentLocation = value;
    },
    pushToken: (state, value) => {
        state.pushNotification = value;
    },
    updateCharacterDyeColor: (state, value) => {
        state.characterDyeColor = value;
    },
    updateCharacterStyle: (state, value) => {
        state.characterHeadStyle = value.headStyle;
        state.characterHeadColor = value.headColor;
    },
    setIsGuest: (state, value) => {
        state.isGuest = value;
    },
    resetPartyMembers: (state) => {
        state.partyMembers = [];
    },
    resetStats: (state, values) => {
        state.characterStats = {
            str: 1,
            dex: 1,
            int: 1,
            vit: 1,
            wis: 1,
            luk: 1
        };

        state.characterStatusPoints = values.statusPoints;
        state.characterAttributes = values.attributes;

        state.characterHp = values.attributes.maxHp;
        state.characterMp = values.attributes.maxMp;
    },
    newPartyInvite: (state) => {
        state.partyInvites++;
    },
    leaveParty: (state) => {
        state.party = false;
        state.partyName = null;
        state.partyMembers = [];
        state.partyLoot = null;
        state.partyHunt = null;
        state.partyHuntPreference = null;
        state.partyTravelPreference = null;
        state.partyLeader = false;
        state.partyLeaderId = 0;
    },
    updateParty: (state, value) => {
        state.partyLoot = value.loot;
        state.partyHunt = value.hunt;
        state.partyHuntPreference = value.huntPreference;
        state.partyTravelPreference = value.travelPreference;
    },
    setPartyMembersIds: (state, value) => {
        state.partyMembersIds = value;
    },
    setPartyMembers: (state, value) => {
        // Reactively update party members
        for (const [key, memberValue] of Object.entries(value)) {
            Vue.set(state.partyMembers, key, memberValue);
        }
    },
    setParty: (state, value) => {
        state.party = true;
        state.partyName = value.name;
        state.partyLoot = value.loot;
        state.partyHunt = value.hunt;
        state.partyHuntPreference = value.huntPreference;
        state.partyTravelPreference = value.travelPreference;
        state.partyLeader = value.leader === state.characterId;
        state.partyLeaderId = value.leader;
    },
    closeTutorial: (state) => {
        state.closeTutorial = new Date();
    },
    soundVolume: (state, value) => {
        state.soundVolume = value;
    },
    musicVolume: (state, value) => {
        state.musicVolume = value;
    },
    sound: (state, value) => {
        state.sound = value;
    },
    music: (state, value) => {
        state.music = value;
    },
    allMaps: (state, value) => {
        state.allMaps = value;
    },
    socketConnection: (state, value) => {
        state.socketConnection = value;
    },
    showChat: (state, value) => {
        state.showChat = value;
    },
    enableChat: (state, value) => {
        state.enableChat = value;
    },
    setHpMp: (state, values) => {
        if (values.hp >= 0) {
            state.characterHp = values.hp;
        }

        if (values.mp >= 0) {
            state.characterMp = values.mp;
        }
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
        state.travelingDungeon = false;
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
        if (values.headColor) {
            state.characterHeadColor = values.headColor;
        }
        if (values.dyeColor) {
            state.characterDyeColor = values.dyeColor;
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
        if (values.job) {
            state.characterJob = values.job;
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
        let statsUpdate = false;

        if (values.stats && values.stats.str) {
            characterStats.str = values.stats.str;
            statsUpdate = true;
        }
        if (values.stats && values.stats.dex) {
            characterStats.dex = values.stats.dex;
            statsUpdate = true;
        }
        if (values.stats && values.stats.int) {
            characterStats.int = values.stats.int;
            statsUpdate = true;
        }
        if (values.stats && values.stats.vit) {
            characterStats.vit = values.stats.vit;
            statsUpdate = true;
        }
        if (values.stats && values.stats.wis) {
            characterStats.wis = values.stats.wis;
            statsUpdate = true;
        }
        if (values.stats && values.stats.luk) {
            characterStats.luk = values.stats.luk;
            statsUpdate = true;
        }
        if (values.statusPoints || values.statusPoints === 0) {
            state.characterStatusPoints = values.statusPoints;
        }

        // Trigger forced update only when there IS an update to the stats
        if (statsUpdate) {
            Vue.set(state, 'characterStats', characterStats);
        }

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
            crit: state.characterAttributes.crit,
            critDef: state.characterAttributes.critDef,
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
        if (values.attributes && values.attributes.crit) {
            characterAttributes.crit = values.attributes.crit;
        }
        if (values.attributes && values.attributes.critDef) {
            characterAttributes.critDef = values.attributes.critDef;
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
            state.characterEquipment.head.id = values.equipment.head.id || 0;
            state.characterEquipment.head.itemId = values.equipment.head.itemId || 0;
            state.characterEquipment.head.name = values.equipment.head.name || '';
            state.characterEquipment.head.refined = values.equipment.head.refined || 0;
            state.characterEquipment.head.durability = values.equipment.head.durability || 0;
        }
        if (values.equipment && values.equipment.face) {
            state.characterEquipment.face.itemId = values.equipment.face.itemId || 0;
            state.characterEquipment.face.name = values.equipment.face.name || '';
        }
        if (values.equipment && values.equipment.mouth) {
            state.characterEquipment.mouth.itemId = values.equipment.mouth.itemId || 0;
            state.characterEquipment.mouth.name = values.equipment.mouth.name || '';
        }
        if (values.equipment && values.equipment.rhand) {
            state.characterEquipment.rhand.id = values.equipment.rhand.id || 0;
            state.characterEquipment.rhand.itemId = values.equipment.rhand.itemId || 0;
            state.characterEquipment.rhand.name = values.equipment.rhand.name || '';
            state.characterEquipment.rhand.refined = values.equipment.rhand.refined || 0;
            state.characterEquipment.rhand.durability = values.equipment.rhand.durability || 0;
        }
        if (values.equipment && values.equipment.garment) {
            state.characterEquipment.garment.id = values.equipment.garment.id || 0;
            state.characterEquipment.garment.itemId = values.equipment.garment.itemId || 0;
            state.characterEquipment.garment.name = values.equipment.garment.name || '';
            state.characterEquipment.garment.refined = values.equipment.garment.refined || 0;
            state.characterEquipment.garment.durability = values.equipment.garment.durability || 0;
        }
        if (values.equipment && values.equipment.body) {
            state.characterEquipment.body.id = values.equipment.body.id || 0;
            state.characterEquipment.body.itemId = values.equipment.body.itemId || 0;
            state.characterEquipment.body.name = values.equipment.body.name || '';
            state.characterEquipment.body.refined = values.equipment.body.refined || 0;
            state.characterEquipment.body.durability = values.equipment.body.durability || 0;
        }
        if (values.equipment && values.equipment.lhand) {
            state.characterEquipment.lhand.id = values.equipment.lhand.id || 0;
            state.characterEquipment.lhand.itemId = values.equipment.lhand.itemId || 0;
            state.characterEquipment.lhand.name = values.equipment.lhand.name || '';
            state.characterEquipment.lhand.refined = values.equipment.lhand.refined || 0;
            state.characterEquipment.lhand.durability = values.equipment.lhand.durability || 0;
        }
        if (values.equipment && values.equipment.footgear) {
            state.characterEquipment.footgear.id = values.equipment.footgear.id || 0;
            state.characterEquipment.footgear.itemId = values.equipment.footgear.itemId || 0;
            state.characterEquipment.footgear.name = values.equipment.footgear.name || '';
            state.characterEquipment.footgear.refined = values.equipment.footgear.refined || 0;
            state.characterEquipment.footgear.durability = values.equipment.footgear.durability || 0;
        }
    },
    characterInit: (state, values) => {
        // Main character data
        state.characterId = values.character.id;
        state.characterName = values.character.name;
        state.characterGender = values.character.gender;
        state.characterHeadStyle = values.character.headStyle;
        state.characterHeadColor = values.character.headColor;
        state.characterDyeColor = values.character.dyeColor;
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
        state.characterAttributes.crit = values.stats.attributes.crit;
        state.characterAttributes.critDef = values.stats.attributes.critDef;
        state.characterAttributes.maxHp = values.stats.attributes.maxHp;
        state.characterAttributes.maxMp = values.stats.attributes.maxMp;
        state.characterAttributes.weight = values.stats.attributes.weight;

        // Skills
        state.characterSkills = values.skills;

        // Equipment
        if (values.equipment && values.equipment.head) {
            state.characterEquipment.head.id = values.equipment.head.id || 0;
            state.characterEquipment.head.itemId = values.equipment.head.itemId || 0;
            state.characterEquipment.head.name = values.equipment.head.name || '';
            state.characterEquipment.head.refined = values.equipment.head.refined || 0;
            state.characterEquipment.head.durability = values.equipment.head.durability || 0;
        }
        if (values.equipment && values.equipment.face) {
            state.characterEquipment.face.itemId = values.equipment.face.itemId || 0;
            state.characterEquipment.face.name = values.equipment.face.name || '';
        }
        if (values.equipment && values.equipment.mouth) {
            state.characterEquipment.mouth.itemId = values.equipment.mouth.itemId || 0;
            state.characterEquipment.mouth.name = values.equipment.mouth.name || '';
        }
        if (values.equipment && values.equipment.rhand) {
            state.characterEquipment.rhand.id = values.equipment.rhand.id || 0;
            state.characterEquipment.rhand.itemId = values.equipment.rhand.itemId || 0;
            state.characterEquipment.rhand.name = values.equipment.rhand.name || '';
            state.characterEquipment.rhand.refined = values.equipment.rhand.refined || 0;
            state.characterEquipment.rhand.durability = values.equipment.rhand.durability || 0;
        }
        if (values.equipment && values.equipment.garment) {
            state.characterEquipment.garment.id = values.equipment.garment.id || 0;
            state.characterEquipment.garment.itemId = values.equipment.garment.itemId || 0;
            state.characterEquipment.garment.name = values.equipment.garment.name || '';
            state.characterEquipment.garment.refined = values.equipment.garment.refined || 0;
            state.characterEquipment.garment.durability = values.equipment.garment.durability || 0;
        }
        if (values.equipment && values.equipment.body) {
            state.characterEquipment.body.id = values.equipment.body.id || 0;
            state.characterEquipment.body.itemId = values.equipment.body.itemId || 0;
            state.characterEquipment.body.name = values.equipment.body.name || '';
            state.characterEquipment.body.refined = values.equipment.body.refined || 0;
            state.characterEquipment.body.durability = values.equipment.body.durability || 0;
        }
        if (values.equipment && values.equipment.lhand) {
            state.characterEquipment.lhand.id = values.equipment.lhand.id || 0;
            state.characterEquipment.lhand.itemId = values.equipment.lhand.itemId || 0;
            state.characterEquipment.lhand.name = values.equipment.lhand.name || '';
            state.characterEquipment.lhand.refined = values.equipment.lhand.refined || 0;
            state.characterEquipment.lhand.durability = values.equipment.lhand.durability || 0;
        }
        if (values.equipment && values.equipment.footgear) {
            state.characterEquipment.footgear.id = values.equipment.footgear.id || 0;
            state.characterEquipment.footgear.itemId = values.equipment.footgear.itemId || 0;
            state.characterEquipment.footgear.name = values.equipment.footgear.name || '';
            state.characterEquipment.footgear.refined = values.equipment.footgear.refined || 0;
            state.characterEquipment.footgear.durability = values.equipment.footgear.durability || 0;
        }

        // Traveling
        if (values.character.traveling) {
            state.characterTraveling = true;
        }

        // Resting
        if (values.character.resting) {
            state.characterResting = true;
        }

        // Crafting
        if (values.character.crafting) {
            state.characterCrafting = true;
        }

        // Setting admin state
        if (values.character.admin) {
            state.admin = values.character.admin;
        }

        // Setting moderator state
        if (values.character.admin) {
            state.moderator = values.character.moderator;
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
    },
    resetState(state) {
        state.resetChat = new Date();

        state.characterId = 0;
        state.characterName = '';
        state.characterGender = 'm';
        state.characterHeadStyle = 0;
        state.characterHeadColor = 0;
        state.characterDyeColor = 0;
        state.characterBaseLevel = 0;
        state.characterJobLevel = 0;
        state.characterBaseExp = 0;
        state.characterBaseExpPercentage = '0.00';
        state.characterJobExp = 0;
        state.characterJobExpPercentage = '0.00';
        state.characterJobId = 0;
        state.characterJob = '';
        state.characterStatusPoints = 0;
        state.characterSkillPoints = 0;
        state.characterLocationId = 0;
        state.characterLocation = '';
        state.characterSaveLocationId = 1;
        state.characterSaveLocation = 1;
        state.characterHp = 42;
        state.characterMp = 13;
        state.characterZeny = 0;

        state.characterStats = {
            str: 0,
            dex: 0,
            int: 0,
            vit: 0,
            wis: 0,
            luk: 0
        };

        state.characterBonusStats = {
            str: 0,
            dex: 0,
            int: 0,
            vit: 0,
            wis: 0,
            luk: 0,
            patk: 0,
            pdef: 0,
            matk: 0,
            mdef: 0,
            hp: 0,
            mp: 0,
            hit: 0,
            eva: 0
        };

        state.characterAttributes = {
            patk: 0,
            matk: 0,
            pdef: 0,
            mdef: 0,
            hit: 0,
            eva: 0,
            speed: 0,
            maxHp: 0,
            maxMp: 0,
            weight: 0
        };

        state.characterSkills = {};

        state.characterEquipment = {
            head: {
                id: 0,
                itemId: 0,
                name: '',
                refined: 0,
                durability: 0
            },
            face: {
                itemId: 0,
                name: ''
            },
            mouth: {
                itemId: 0,
                name: ''
            },
            rhand: {
                id: 0,
                itemId: 0,
                name: '',
                refined: 0,
                durability: 0
            },
            garment: {
                id: 0,
                itemId: 0,
                name: '',
                refined: 0,
                durability: 0
            },
            body: {
                id: 0,
                itemId: 0,
                name: '',
                refined: 0,
                durability: 0
            },
            lhand: {
                id: 0,
                itemId: 0,
                name: '',
                refined: 0,
                durability: 0
            },
            footgear: {
                id: 0,
                itemId: 0,
                name: '',
                refined: 0,
                durability: 0
            }
        };

        state.travelingDungeon = false;
        state.dockedMenu = false;
        state.huntStatus = false;
        state.huntEndTimer = null;
        state.chatContent = [];
        state.inventory = [];
        state.inventoryWeight = 0;

        state.bonusStats = {
            str: 0,
            dex: 0,
            int: 0,
            vit: 0,
            wis: 0,
            luk: 0,
            patk: 0,
            pdef: 0,
            matk: 0,
            mdef: 0,
            hp: 0,
            mp: 0,
            hit: 0,
            eva: 0
        };

        state.showChat = true;
        state.enableChat = false;
        state.socketConnection = false;
        state.allMaps = null;
        state.selfBagItemInfo = false;
        state.closeItemInfo = null;

        state.party = false;
        state.partyName = null;
        state.partyMembers = [];
        state.partyLoot = null;
        state.partyHunt = null;
        state.partyHuntPreference = null;
        state.partyTravelPreference = null;
        state.partyLeader = false;
        state.partyLeaderId = 0;
        state.partyInvites = 0;
        state.pushNotification = null;
        state.currentLocation = null;
        state.puzzleChallenge = null;
        state.puzzleChallengeNr = 0;
        state.puzzleChallengeLeader = null;
        state.tradeRequestId = 0;
        state.tradeRequestName = null;
        state.craftTimer = null;
        state.craftData = null;
        state.characterCrafting = false;
        state.characterTraveling = false;
        state.travelTimer = null;
        state.travelData = {
            locationId: 0,
            name: ''
        };
        state.restTimer = null;
        state.characterResting = false;

        state.admin = 0;
        state.moderator = 0;
    }
};