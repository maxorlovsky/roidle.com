export default {
    get: (state) => (name) => state[name],
    characterName: (state) => state.characterName,
    characterStats: (state) => state.characterStats,
    characterJob: (state) => state.characterJob,
    characterStatusPoints: (state) => state.characterStatusPoints,
    characterBaseLevel: (state) => state.characterBaseLevel,
    characterJobLevel: (state) => state.characterJobLevel,
    headStyle: (state) => state.characterHeadStyle,
    gender: (state) => state.gender
};