export default {
    get: (state) => (name) => state[name],
    dockedMenu: (state) => state.dockedMenu,
    characterName: (state) => state.characterName,
    characterStats: (state) => state.characterStats,
    characterJobId: (state) => state.characterJobId,
    characterStatusPoints: (state) => state.characterStatusPoints,
    characterBaseLevel: (state) => state.characterBaseLevel,
    characterJobLevel: (state) => state.characterJobLevel,
    characterHeadStyle: (state) => state.characterHeadStyle,
    characterGender: (state) => state.characterGender,
    characterSkills: (state) => state.characterSkills,
    characterSkillPoints: (state) => state.characterSkillPoints
};