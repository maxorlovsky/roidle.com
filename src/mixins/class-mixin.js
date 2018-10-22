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

            console.log(stats);
            console.log(params);

            const statsModifiers = classes.find((obj) => obj.id === classId).statsModifiers;

            for (const stat of ['pow', 'wis', 'hea']) {
                for (const modifier of statsModifiers[stat]) {
                    console.log(modifier);
                }
                // 1 console.log(statsModifiers[stat]);
            }
        }
    }
};

export default classMixin;