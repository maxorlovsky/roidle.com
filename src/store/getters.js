export default {
    get: (state) => (name) => state[name],
    serverUrl: (state) => state.serverUrl,
    dockedMenu: (state) => state.dockedMenu,
    characterId: (state) => state.characterId,
    characterName: (state) => state.characterName,
    characterStats: (state) => state.characterStats,
    characterBonusStats: (state) => state.characterBonusStats,
    characterAttributes: (state) => state.characterAttributes,
    characterJobId: (state) => state.characterJobId,
    characterJob: (state) => state.characterJob,
    characterStatusPoints: (state) => state.characterStatusPoints,
    characterBaseLevel: (state) => state.characterBaseLevel,
    characterJobLevel: (state) => state.characterJobLevel,
    characterBaseExp: (state) => state.characterBaseExp,
    characterBaseExpPercentage: (state) => state.characterBaseExpPercentage,
    characterJobExp: (state) => state.characterJobExp,
    characterJobExpPercentage: (state) => state.characterJobExpPercentage,
    characterHeadStyle: (state) => state.characterHeadStyle,
    characterHeadColor: (state) => state.characterHeadColor,
    characterDyeColor: (state) => state.characterDyeColor,
    characterGender: (state) => state.characterGender,
    characterSkills: (state) => state.characterSkills,
    characterSkillPoints: (state) => state.characterSkillPoints,
    characterLocationId: (state) => state.characterLocationId,
    characterLocation: (state) => state.characterLocation,
    characterSaveLocationId: (state) => state.characterSaveLocationId,
    characterSaveLocation: (state) => state.characterSaveLocation,
    characterZeny: (state) => state.characterZeny,
    characterHp: (state) => state.characterHp,
    characterMp: (state) => state.characterMp,
    huntStatus: (state) => state.huntStatus,
    huntEndTimer: (state) => state.huntEndTimer,
    chatContent: (state) => state.chatContent,
    inventory: (state) => state.inventory,
    inventoryWeight: (state) => state.inventoryWeight,
    characterEquipment: (state) => state.characterEquipment,
    showChat: (state) => state.showChat,
    enableChat: (state) => state.enableChat,
    socketConnection: (state) => state.socketConnection,
    allMaps: (state) => state.allMaps,
    closeItemInfo: (state) => state.closeItemInfo,
    selfBagItemInfo: (state) => state.selfBagItemInfo,
    music: (state) => state.music,
    musicVolume: (state) => state.musicVolume,
    sound: (state) => state.sound,
    soundVolume: (state) => state.soundVolume,
    resetChat: (state) => state.resetChat,
    closeTutorial: (state) => state.closeTutorial,
    admin: (state) => state.admin,
    party: (state) => state.party,
    partyName: (state) => state.partyName,
    partyMembers: (state) => state.partyMembers,
    partyMembersIds: (state) => state.partyMembersIds,
    partyLeader: (state) => state.partyLeader,
    partyLeaderId: (state) => state.partyLeaderId,
    partyLoot: (state) => state.partyLoot,
    partyHunt: (state) => state.partyHunt,
    partyHuntPreference: (state) => state.partyHuntPreference,
    partyTravelPreference: (state) => state.partyTravelPreference,
    isGuest: (state) => state.isGuest,
    pushNotification: (state) => state.pushNotification,
    currentLocation: (state) => state.currentLocation,
    puzzleChallenge: (state) => state.puzzleChallenge,
    puzzleChallengeNr: (state) => state.puzzleChallengeNr,
    puzzleChallengeLeader: (state) => state.puzzleChallengeLeader,
    tradeRequestId: (state) => state.tradeRequestId,
    tradeRequestName: (state) => state.tradeRequestName,
    characterCrafting: (state) => state.characterCrafting,
    craftTimer: (state) => state.craftTimer,
    craftData: (state) => state.craftData,
    characterTraveling: (state) => state.characterTraveling,
    travelTimer: (state) => state.travelTimer,
    travelData: (state) => state.travelData,
    characterResting: (state) => state.characterResting,
    restTimer: (state) => state.restTimer,
    publicItemInfo: (state) => state.publicItemInfo,
    gameModal: (state) => state.gameModal,
    partyAvailableSkillsIds: (state) => state.partyAvailableSkillsIds,
    closeSkillInfo: (state) => state.closeSkillInfo,
    attributesComponents: (state) => state.attributesComponents,
    huntField: (state) => state.huntField
};