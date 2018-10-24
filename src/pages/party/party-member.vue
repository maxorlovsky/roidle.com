<template>
    <section class="party-page">
        <div class="heading">{{ member.name }}</div>

        <div v-if="Object.keys(member).length"
            class=""
        >
            <div class="top-member-info">
                <div class="avatar"></div>
                <div class="info">
                    <div class="level">{{ job }} / L{{ member.level }}</div>
                    <div class="hp">HP: {{ member.hp }} / {{ member.params.health }}</div>
                    <div class="xp">XP: {{ member.exp }} / 100</div>
                </div>
            </div>

            <div class="member-stats">
                <div class="stats">
                    <div v-for="stat of memberStats"
                        :key="stat.attr"
                        class="stat"
                    >
                        <div>{{ stat.name }}: {{ member.stats[stat.attr] }}</div>
                        <div v-if="member.statPoints"
                            class="stat-upgrade"
                        >
                            <div :class="{'disabled': !tempStats[stat.attr] }"
                                class="stat-action"
                                @click="allocateStat(stat.attr, false)"
                            >-</div>
                            <span>/</span>
                            <div :class="{'disabled': !tempStats.points }"
                                class="stat-action"
                                @click="allocateStat(stat.attr, true)"
                            >+</div>
                        </div>
                    </div>
                </div>

                <div class="stats-manipulation">
                    <div class="available-stats">Available stat points: {{ tempStats.points }}</div>
                    <button v-if="tempStats.pow || tempStats.wis || tempStats.hea"
                        class="btn btn-success save-stats"
                        @click="confirmStats()"
                    >Confirm</button>
                </div>
            </div>

            <div class="member-params">
                <div class="params-separator">
                    <div class="">ATK: {{ member.params.atk }}</div>
                    <div class="">M.ATK: {{ member.params.matk }}</div>
                </div>
                <div class="params-separator">
                    <div class="">DEF: {{ member.params.def }}</div>
                    <div class="">M.DEF: {{ member.params.mdef }}</div>
                </div>
                <div class="params-separator">
                    <div class="">Acc: {{ member.params.acc }}</div>
                    <div class="">Crit: {{ member.params.crit }}</div>
                </div>
            </div>
<!-- {{member}} -->
        </div>
    </section>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

// Configs
import classes from '../../../config/classes.json';

// Mixins
import classMixin from '../../mixins/class-mixin.js';

const partyMemberPage = {
    mixins: [classMixin],
    data() {
        return {
            id: this.$route.params.id,
            job: '',
            tempStats: {
                points: 0,
                pow: 0,
                wis: 0,
                hea: 0
            },
            memberStats: [
                {
                    attr: 'pow',
                    name: 'Power'
                },
                {
                    attr: 'wis',
                    name: 'Wisdom'
                },
                {
                    attr: 'hea',
                    name: 'Health'
                }
            ]
        };
    },
    computed: {
        member() {
            const member = this.$store.getters.get('party')[this.$route.params.id] || {};

            if (Object.keys(member).length) {
                this.queryMemberData(member);
            }

            return member;
        }
    },
    created() {

    },
    beforeDestroy() {
        const member = this.$store.getters.get('party')[this.id];
        
        // Recalculating member stats
        member.stats.pow -= this.tempStats.pow;
        member.stats.wis -= this.tempStats.wis;
        member.stats.hea -= this.tempStats.hea;

        member.params = this.recalculateParams(member);
    },
    methods: {
        queryMemberData(member) {
            // Fetch class name
            this.job = classes.find((job) => job.id === member.class).name;

            // Saving available statpoints if we have any
            this.tempStats.points = member.statPoints;
        },
        allocateStat(stat, increment) {
            if (increment) {
                // In case there is 0 stat points, we hold the increment
                if (!this.tempStats.points) {
                    return false;
                }

                // Increase temporary stat
                this.tempStats[stat]++;

                // Increase member stat
                this.member.stats[stat]++;

                // Decrease available points
                this.tempStats.points--;

                this.member.params = this.recalculateParams(this.member);

                return true;
            }

            // Otherwise decreasing
            // If temporary stat that we're decreasing is already on 0, we can't decrease more
            if (!this.tempStats[stat]) {
                return false;
            }

            // Decrease temporary stat
            this.tempStats[stat]--;

            // Decrease member stat
            this.member.stats[stat]--;

            // Increase available points
            this.tempStats.points++;

            this.member.params = this.recalculateParams(this.member);

            return true;
        },
        recalculateParams(member) {
            return this.getClassParams(member.class, member.stats);
        },
        confirmStats() {
            // Reseting temporary stats
            this.tempStats.pow = 0;
            this.tempStats.wis = 0;
            this.tempStats.hea = 0;

            // Removing used points
            this.member.statPoints -= (this.member.statPoints - this.tempStats.points);

            // Updating current HP to maximum
            this.member.hp = this.member.params.health;

            // Get clean data of party and update specific member
            const party = this.$store.getters.get('party');
            party[this.$route.params.id] = this.member;

            // Update party in vuex and storage
            this.$store.commit('saveParty', party);

            // Saving token in localStorage after how many days it should expire
            // 604800000 = 7 * 90 days
            functions.storage('set', 'party', party, 604800000 * 90);
        }
    }
};

// Routing
mo.routes.push({
    path: '/party/:id',
    component: partyMemberPage
});

export default partyMemberPage;
</script>