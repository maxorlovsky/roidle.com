<template>
    <div class="char-info">
        <avatar :head-style="characterHeadStyle"
            :gender="characterGender"
            :just-head="true"
        />

        <div class="char-info__description">
            <span class="char-info__description__name">{{ characterName }}</span>
            <span class="char-info__description__job">{{ jobTitle }}</span>
        </div>

        <div class="char-info__health">
            <span class="char-info__health__hp"><span>HP:</span> 1 / {{ maxHp }}</span>
            <span class="char-info__health__mp"><span>MP:</span> 1 / {{ maxMp }}</span>
        </div>

        <div class="char-info__levels">
            <span class="char-info__levels__base">B.Lv: {{ characterBaseLevel }} (0.00%)</span>
            <span class="char-info__levels__job">J.Lv: {{ characterJobLevel }} (0.00%)</span>
        </div>

        <div class="char-info__location">
            <span class="char-info__location__place">Location: Prontera</span>
            <span class="char-info__location__party">Party: --</span>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import jobs from '../../../config/jobs.json';

// Components
import avatar from '../avatar/avatar.vue';

// Utils
import statsUtils from '../../utils/stats.js';

export default {
    name: 'char-info-top',
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
        ...mapGetters(['characterName', 'characterJobId', 'characterHeadStyle', 'characterGender', 'characterBaseLevel', 'characterJobLevel', 'characterStats', 'characterStatusPoints'])
    },
    watch: {
        characterStatusPoints() {
            this.calculateStats();
        }
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
</script>