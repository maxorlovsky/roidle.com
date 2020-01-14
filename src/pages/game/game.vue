<template>
    <section class="game">
        <div class="info">
            <avatar :head-style="characterHeadStyle"
                :gender="characterGender"
                :just-head="true"
            />

            <div class="info__description">
                <span class="info__description__name">{{ characterName }}</span>
                <span class="info__description__job">{{ jobTitle }}</span>
            </div>

            <div class="info__health">
                <span class="info__health__hp"><span>HP:</span> 1 / {{ maxHp }}</span>
                <span class="info__health__mp"><span>MP:</span> 1 / {{ maxMp }}</span>
            </div>

            <div class="info__levels">
                <span class="info__levels__base">B.Lv: {{ characterBaseLevel }}</span>
                <span class="info__levels__job">J.Lv: {{ characterJobLevel }}</span>
            </div>

            <div class="info__exp">
                <span class="info__exp__base">XP: 0.00%</span>
                <span class="info__exp__job">XP: 0.00%</span>
            </div>

            <div class="info__location">
                <span class="info__location__place">Location: Prontera</span>
                <span class="info__location__party">Party: --</span>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import jobs from '../../../config/jobs.json';

// Components
import avatar from '../../components/avatar/avatar.vue';

// Utils
import statsUtils from '../../utils/stats.js';

const gamePage = {
    components: {
        avatar
    },
    data() {
        return {
            jobTitle: '',
            maxHp: 0,
            maxMp: 0,
        };
    },
    computed: {
        ...mapGetters(['characterName', 'characterJobId', 'characterHeadStyle', 'characterGender', 'characterBaseLevel', 'characterJobLevel', 'characterStats'])
    },
    mounted() {
        this.$nextTick(() => {
            this.calculateStats();

            const foundJob = jobs.find((job) => job.id === this.characterJobId);

            this.jobTitle = foundJob.name;
        });
    },
    methods: {
        calculateStats() {
            this.maxHp = statsUtils.getHpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.vit);
            this.maxMp = statsUtils.getMpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.wis, this.characterStats.int);
        }
    }
};

// Routing
mo.routes.push({
    path: '/game',
    component: gamePage
});

export default gamePage;
</script>