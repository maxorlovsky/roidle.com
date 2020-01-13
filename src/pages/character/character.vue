<template>
    <section class="character">
        <div class="info">
            <div class="info-avatar">
                <div class="info-avatar__body"><img :src="`/dist/assets/images/bodies/novice_${gender}_0.png`"></div>
                <div class="info-avatar__head"><img :src="`/dist/assets/images/heads/${headStyle}_${gender}.gif`"></div>
            </div>
            <div class="info__description">
                <span class="info__description__name">{{ characterName }}</span>
                <span class="info__description__job">{{ characterJob.title }}</span>
            </div>

            <div class="info__health">
                <span class="info__health__hp"><span>HP:</span> {{ maxHp }} / {{ maxHp }}</span>
                <span class="info__health__mp"><span>MP:</span> 100 / 100</span>
            </div>

            <div class="info__levels">
                <span class="info__levels__base">Base Lv: {{ characterBaseLevel }}</span>
                <span class="info__levels__job">Job Lv: {{ characterJobLevel }}</span>
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

        <div class="equipment">
            <div class="equipment__left">
                <div class="equipment__head"><span class="equipment__placeholder">head</span></div>
                <div class="equipment__rhand"><span class="equipment__placeholder">R-hand</span></div>
                <div class="equipment__robe"><span class="equipment__placeholder">robe</span></div>
                <div class="equipment__accessory"><span class="equipment__placeholder">accessory</span></div>
            </div>
            <div class="equipment__avatar">
                <div class="equipment__avatar__body"><img :src="`/dist/assets/images/bodies/novice_${gender}_0.png`"></div>
                <div class="equipment__avatar__head"><img :src="`/dist/assets/images/heads/${headStyle}_${gender}.gif`"></div>
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
            :job-id="characterJob.id"
            :job-level="characterJobLevel"
        />
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import stats from '../../components/stats/stats.vue';

const characterPage = {
    components: {
        stats
    },
    data() {
        return {
            maxHp: 0
        };
    },
    computed: {
        ...mapGetters(['characterName', 'characterStats', 'characterStatusPoints', 'characterBaseLevel', 'characterJobLevel', 'characterJob', 'headStyle', 'gender']),
        party() {
            return this.$store.getters.get('party') || [];
        }
    },
    created() {
        this.calculateMaxHP();
    },
    methods: {
        calculateMaxHP() {
            let baseHp = 35;

            baseHp += this.characterBaseLevel * 1;

            for (let i = 2; i <= this.characterBaseLevel; i++) {
                baseHp += Math.round(1 * i);
            }

            let maxHp = baseHp;

            maxHp = Math.floor(maxHp * (1 + this.characterStats.vit * 0.01) * 1);

            maxHp += 1;

            maxHp = Math.floor(maxHp * (1 + 1 * 0.01));

            this.maxHp = maxHp;
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