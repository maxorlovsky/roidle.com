// Configs
import classes from '../../config/classes.json';

const classMixin = {
    methods: {
        getClassParams(classId, stats) {
            const params = {
                atk: 0,
                matk: 0,
                acc: 0,
                crit: 0,
                def: 0,
                mdef: 0,
                health: 0
            };

            const statsModifiers = classes.find((obj) => obj.id === classId).statsModifiers;

            // Looping stats
            for (const stat of Object.keys(stats)) {
                // Looping class stats modifiers
                for (const modifier of Object.keys(statsModifiers[stat])) {
                    // If it's not 0, go for formula
                    if (statsModifiers[stat][modifier]) {
                        params[modifier] = Math.floor(params[modifier] + (stats[stat] * statsModifiers[stat][modifier]));
                    }
                }
            }

            // Return hero parameters
            return params;
        },
        getClassDataById(classId) {
            return classes.find((obj) => obj.id === classId);
        }
    }
};

export default classMixin;