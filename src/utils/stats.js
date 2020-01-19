// Configs
import jobs from '../../config/jobs.json';

export default {
    getHpFormula(jobId, level = 1, jlevel = 1, vit = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        return Math.floor(35 + level + (level * Math.floor(level / foundJob.dividers.hp.level))) + Math.floor((vit + bonusStats.vit) * 100 / foundJob.dividers.hp.vit);
    },
    getMpFormula(jobId, level = 1, jlevel = 1, wis = 1, int = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        return Math.floor(10 + level + (level * Math.floor(level / foundJob.dividers.mp.level))) + Math.floor((wis + bonusStats.wis) * 50 / foundJob.dividers.mp.wis) + Math.floor((int + bonusStats.int) * 25 / foundJob.dividers.mp.int);
    },
    getPatkFormula(jobId, level = 1, jlevel = 1, str = 1, dex = 1, luk = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        return Math.floor(Math.floor(level / 4) + Math.floor((str + bonusStats.str) / foundJob.dividers.patk.str) + Math.floor((dex + bonusStats.dex) / foundJob.dividers.patk.dex) + Math.floor((luk + bonusStats.luk) / foundJob.dividers.patk.luk));
    },
    getMatkFormula(jobId, level = 1, jlevel = 1, int = 1, dex = 1, luk = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        return Math.floor(Math.floor(level / 4) + Math.floor((int + bonusStats.int) / foundJob.dividers.matk.int) + Math.floor((int + bonusStats.int) / 2) + Math.floor((dex + bonusStats.dex) / foundJob.dividers.matk.dex) + Math.floor((luk + bonusStats.luk) / foundJob.dividers.matk.luk));
    },
    // Calculation of damage campare to def counterpart atk.damage - (atk.damage * (target.def / 100))
    // Hard cap at 90%
    getPdefFormula(jobId, level = 1, jlevel = 1, vit = 1, wis = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        let result = Math.floor(Math.floor((vit + bonusStats.vit) / foundJob.dividers.pdef.vit) + Math.floor((wis + bonusStats.wis) / foundJob.dividers.pdef.wis) + Math.floor(level / 4));

        if (result > 90) {
            result = 90;
        }

        return result;
    },
    getMdefFormula(jobId, level = 1, jlevel = 1, wis = 1, vit = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        let result = Math.floor(Math.floor((wis + bonusStats.wis) / foundJob.dividers.mdef.wis) + Math.floor((vit + bonusStats.vit) / foundJob.dividers.mdef.vit) + Math.floor(level / 5));

        if (result > 90) {
            result = 90;
        }

        return result;
    },
    // Calculation of hit/dodge (attacker accuracy * 200) / (attacker accuracy + target eva)
    getHitFormula(jobId, level = 1, jlevel = 1, dex = 1, luk = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        return Math.floor(level + (dex + bonusStats.dex) + Math.floor((dex + bonusStats.dex) / foundJob.dividers.hit.dex) + Math.floor((luk + bonusStats.luk) / 3));
    },
    getEvaFormula(jobId, level = 1, jlevel = 1, dex = 1, luk = 1) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = this.calculateBonusStats(jobId, jlevel);

        return Math.floor(level + (dex + bonusStats.dex) + Math.floor((dex + bonusStats.dex) / foundJob.dividers.eva.dex) + Math.floor((luk + bonusStats.luk) / 5));
    },
    // Time it takes to finish the map in %
    // Hard cap from member 25%
    // Hard cap from party 75%
    getSpeedFormula(dex) {
        let result = Math.floor(dex / 4);

        if (result > 25) {
            result = 25;
        }

        return result;
    },
    getWeightFormula(str) {
        const result = 2000 + 30 * str;

        return result;
    },
    calculateBonusStats(jobId, jobLevel) {
        const foundJob = jobs.find((job) => job.id === jobId);
        const bonusStats = {
            str: 0,
            dex: 0,
            int: 0,
            vit: 0,
            wis: 0,
            luk: 0
        };
        let i = 0;

        for (const num of foundJob.statsBonuses.split(',')) {
            // In case job level reached, we stop calculating bonuses
            if (i >= jobLevel) {
                break;
            }

            switch (Number(num)) {
                case 1:
                    bonusStats.str++;
                    break;
                case 2:
                    bonusStats.dex++;
                    break;
                case 3:
                    bonusStats.int++;
                    break;
                case 4:
                    bonusStats.vit++;
                    break;
                case 5:
                    bonusStats.wis++;
                    break;
                case 6:
                    bonusStats.luk++;
                    break;
                default:
                    break;
            }

            ++i;
        }

        return bonusStats;
    }
};