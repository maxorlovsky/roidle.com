<template>
    <section class="character">
        <char-info-top />

        <div class="equipment">
            <div class="equipment__left">
                <div class="equipment__head"><span class="equipment__placeholder">head</span></div>
                <div class="equipment__rhand"><span class="equipment__placeholder">R-hand</span></div>
                <div class="equipment__robe"><span class="equipment__placeholder">robe</span></div>
                <div class="equipment__accessory"><span class="equipment__placeholder">accessory</span></div>
            </div>
            <div class="equipment__avatar">
                <avatar :head-style="characterHeadStyle"
                    :gender="characterGender"
                />
            </div>
            <div class="equipment__right">
                <div class="equipment__body"><span class="equipment__placeholder">body</span></div>
                <div class="equipment__lhand"><span class="equipment__placeholder">L-hand</span></div>
                <div class="equipment__shoes"><span class="equipment__placeholder">shoes</span></div>
                <div class="equipment__accessory"><span class="equipment__placeholder">accessory</span></div>
            </div>
        </div>

        <stats :stats="characterStats"
            :status-points="characterStatusPoints"
            :job-id="characterJobId"
            :base-level="characterBaseLevel"
            :job-level="characterJobLevel"
        />

        <button class="btn btn-warning btn-lg skills-button"
            @click="goToSkills()"
        >Skills</button>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import jobs from '../../../config/jobs.json';

// Components
import avatar from '../../components/avatar/avatar.vue';
import charInfoTop from '../../components/char-info-top/char-info-top.vue';
import stats from '../../components/stats/stats.vue';

// Utils
import statsUtils from '../../utils/stats.js';

const characterPage = {
    components: {
        avatar,
        charInfoTop,
        stats
    },
    data() {
        return {
            maxHp: 0,
            maxMp: 0,
            jobTitle: ''
        };
    },
    computed: {
        ...mapGetters(['characterName', 'characterStats', 'characterStatusPoints', 'characterBaseLevel', 'characterJobLevel', 'characterJobId', 'characterHeadStyle', 'characterGender']),
        party() {
            return this.$store.getters.get('party') || [];
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
        },
        goToSkills() {
            this.$router.push('/character/skills');
        }
    }
};

// Routing
mo.routes.push({
    path: '/character',
    component: characterPage
});

export default characterPage;
</script>