// Utilities
import { functions } from '@utils/functions.js';

export default {
    serverUrl: '',
    characterId: 0,
    characterName: '',
    characterGender: 'm',
    characterHeadStyle: 0,
    characterHeadColor: 0,
    characterDyeColor: 0,
    characterBaseLevel: 0,
    characterJobLevel: 0,
    characterBaseExp: 0,
    characterBaseExpPercentage: '0.00',
    characterJobExp: 0,
    characterJobExpPercentage: '0.00',
    characterJobId: 0,
    characterJob: '',
    characterStatusPoints: 0,
    characterSkillPoints: 0,
    characterLocationId: 0,
    characterLocation: '',
    characterSaveLocationId: 1,
    characterSaveLocation: 1,
    characterHp: 42,
    characterMp: 13,
    characterZeny: 0,

    characterStats: {
        str: 0,
        dex: 0,
        int: 0,
        vit: 0,
        wis: 0,
        luk: 0
    },
    characterBonusStats: {
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
    },
    characterAttributes: {
        patk: 0,
        matk: 0,
        pdef: 0,
        mdef: 0,
        hit: 0,
        eva: 0,
        speed: 0,
        crit: 0,
        critDef: 0,
        maxHp: 0,
        maxMp: 0,
        weight: 0
    },

    characterSkills: {},

    characterEquipment: {
        head: {
            itemId: 0,
            name: '',
            refined: 0
        },
        face: {
            itemId: 0,
            name: '',
            refined: 0
        },
        mouth: {
            itemId: 0,
            name: '',
            refined: 0
        },
        rhand: {
            itemId: 0,
            name: '',
            refined: 0
        },
        garment: {
            itemId: 0,
            name: '',
            refined: 0
        },
        body: {
            itemId: 0,
            name: '',
            refined: 0
        },
        lhand: {
            itemId: 0,
            name: '',
            refined: 0
        },
        footgear: {
            itemId: 0,
            name: '',
            refined: 0
        },
        acc1: {
            itemId: 0,
            name: '',
            refined: 0
        },
        acc2: {
            itemId: 0,
            name: '',
            refined: 0
        }
    },
    dockedMenu: false,
    huntStatus: false,
    huntEndTimer: null,
    chatContent: [],
    inventory: [],
    inventoryWeight: 0,
    bonusStats: {
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
    },
    showChat: true,
    enableChat: false,
    socketConnection: false,
    allMaps: null,
    selfBagItemInfo: false,
    closeItemInfo: null,
    // eslint-disable-next-line
    music: functions.storage('get', 'music') === false ? false : true,
    musicVolume: functions.storage('get', 'musicVolume') && functions.storage('get', 'musicVolume') >= 0 ? functions.storage('get', 'musicVolume') : 0.3,
    // eslint-disable-next-line
    sound: functions.storage('get', 'sound') === false ? false : true,
    soundVolume: functions.storage('get', 'soundVolume') && functions.storage('get', 'soundVolume') >= 0 ? functions.storage('get', 'soundVolume') : 0.3,
    // eslint-disable-next-line
    ambience: functions.storage('get', 'ambience') === false ? false : true,
    ambienceVolume: functions.storage('get', 'ambienceVolume') && functions.storage('get', 'ambienceVolume') >= 0 ? functions.storage('get', 'ambienceVolume') : 0.1,
    resetChat: null,
    closeTutorial: null,
    admin: 0,
    moderator: 0,
    party: false,
    partyName: null,
    partyMembers: [],
    partyMembersIds: [],
    partyLeader: false,
    partyLeaderId: 0,
    partyInvites: 0,
    partyLoot: null,
    partyHunt: null,
    partyHuntPreference: null,
    partyTravelPreference: null,
    isGuest: false,
    pushNotification: '',
    currentLocation: null,
    puzzleChallenge: null,
    puzzleChallengeNr: 0,
    puzzleChallengeLeader: false,
    tradeRequestId: 0,
    tradeRequestName: '',
    // Crafting
    characterCrafting: false,
    craftTimer: null,
    craftData: null,
    // Traveling
    characterTraveling: false,
    travelTimer: null,
    travelData: {
        locationId: 0,
        name: ''
    },
    travelingDungeon: false,
    // Resting
    characterResting: false,
    restTimer: null,
    publicItemInfo: null,
    gameModal: null,
    partyAvailableSkillsIds: {},
    closeSkillInfo: null,
    attributesComponents: {
        patk: 0,
        matk: 0,
        pdef: 0,
        mdef: 0,
        hit: 0,
        eva: 0,
        speed: 0,
        crit: 0,
        critDef: 0,
        maxHp: 0,
        maxMp: 0,
        publicProfile: false,
        monster: false,
        name: '',
        job: '',
        baseLevel: 0,
        jobLevel: 0,
        partyName: '--',
        guildName: '--'
    },
    huntField: null,
    allSkillsNames: [],
    allItemsNames: [],
    putIntoChat: '',
    online: 0,
    hunts: 0,
    playersRegistered: 0,
    serverHour: 0,
};