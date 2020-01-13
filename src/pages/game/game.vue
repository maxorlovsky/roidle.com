<template>
    <section class="game">
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
                <span class="info__health__hp"><span>HP:</span> 100 / 100</span>
                <span class="info__health__mp"><span>MP:</span> 100 / 100</span>
            </div>

            <div class="info__levels">
                <span class="info__levels__base">Base Lv: 1</span>
                <span class="info__levels__job">Job Lv: 1</span>
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
import { mapGetters } from 'vuex';

const gamePage = {
    data() {
        return {};
    },
    computed: {
        ...mapGetters(['characterName', 'characterJob', 'headStyle', 'gender']),
        party() {
            return this.$store.getters.get('party') || [];
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