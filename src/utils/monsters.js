// Configs
import monsters from '../../config/monsters.json';

// Utils
import statsUtils from './stats.js';

export default {
    getMonster(id) {
        const findMonster = monsters[id];

        if (!findMonster) {
            console.error(`[ERROR]: Monster by id ${id} not found`);

            return false;
        }

        const monster = findMonster.split(',');

        const monsterData = {
            id: id,
            name: monster[0],
            level: Number(monster[1]),
            str: Number(monster[4]),
            dex: Number(monster[5]),
            int: Number(monster[6]),
            vit: Number(monster[7]),
            wis: Number(monster[8]),
            luk: Number(monster[9]),
            hp: statsUtils.getHpFormula(9999, Number(monster[1]), 1, Number(monster[7])),
            mp: statsUtils.getMpFormula(9999, Number(monster[1]), 1, Number(monster[8]), Number(monster[6])),
            patk: statsUtils.getPatkFormula(9999, Number(monster[1]), 1, Number(monster[4]), Number(monster[5]), Number(monster[9])),
            matk: statsUtils.getMatkFormula(9999, Number(monster[1]), 1, Number(monster[6]), Number(monster[5]), Number(monster[9])),
            pdef: statsUtils.getPdefFormula(9999, Number(monster[1]), 1, Number(monster[7]), Number(monster[8])),
            mdef: statsUtils.getMdefFormula(9999, Number(monster[1]), 1, Number(monster[8]), Number(monster[7])),
            hit: statsUtils.getHitFormula(9999, Number(monster[1]), 1, Number(monster[5]), Number(monster[9])),
            eva: statsUtils.getEvaFormula(9999, Number(monster[1]), 1, Number(monster[5]), Number(monster[9])),
            exp: Number(monster[2]),
            jexp: Number(monster[3])
        };

        monsterData.currentHp = monsterData.hp;
        monsterData.currentMp = monsterData.mp;

        return monsterData;
    }
};