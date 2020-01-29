export default {
    characterId: 0,
    characterName: '',
    characterGender: 'm',
    characterHeadStyle: 0,
    characterBaseLevel: 1,
    characterJobLevel: 1,
    characterBaseExp: 0,
    characterJobExp: 0,
    characterJobId: 0,
    characterJob: '',
    characterStatusPoints: 0,
    characterSkillPoints: 0,
    characterLocationId: 1,
    characterLocation: '',
    characterSaveLocationId: 1,
    characterSaveLocation: 1,
    characterHp: 42,
    characterMp: 13,
    characterZeny: 0,

    characterStatsTrigger: null,
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
        }
    },
    travelingToLocation: 0,
    restInProgress: false,
    party: [],
    dockedMenu: false,
    fightStatus: false,
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
    showChat: false,
    socketConnection: false
};