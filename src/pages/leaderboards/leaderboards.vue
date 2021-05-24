<template>
    <div class="leaderboards">
        <h1>{{ $t('leaderboards.leaderboard') }}</h1>

        <p class="leaderboards__notice">{{ $t('leaderboards.updatesNotice') }}</p>

        <loading v-if="loading" />
        <div v-else
            class="leaderboards__wrapper"
        >
            <div v-for="(topLeaderboard, jobName) in topJobsLeaderboards"
                :key="jobName"
                class="leaderboards__board"
            >
                <h2>{{ $t('leaderboards.top') }} {{ jobName }}</h2>

                <div class="leaderboards__item leaderboards__titles">
                    <div class="leaderboards__item__avatar">{{ $t('leaderboards.avatar') }}</div>
                    <div class="leaderboards__item__name">{{ $t('leaderboards.name') }}</div>
                    <div class="leaderboards__item__value">{{ $t('leaderboards.level') }}</div>
                </div>

                <a v-for="leaderboard in topLeaderboard"
                    :key="leaderboard.id"
                    :href="`${serverUrl}/public/character/${leaderboard.name}`"
                    target="_blank"
                    class="leaderboards__item"
                >
                    <avatar :head-style="leaderboard.headStyle"
                        :head-color="leaderboard.headColor"
                        :dye-color="leaderboard.dyeColor"
                        :gender="leaderboard.gender"
                        :job="leaderboard.jobName"
                        :framed="true"
                        :head-gears="[
                            leaderboard.head,
                            leaderboard.face,
                            leaderboard.mouth
                        ]"
                    />

                    <div class="leaderboards__item__name">
                        {{ leaderboard.name }}
                    </div>

                    <div class="leaderboards__item__value">
                        {{ leaderboard.value }}
                    </div>
                </a>
            </div>

            <div v-for="board in otherLeaderboards"
                :key="board.label"
                class="leaderboards__board"
            >
                <h2>{{ $t(board.label) }}</h2>

                <div class="leaderboards__item leaderboards__titles">
                    <div class="leaderboards__item__avatar">{{ $t('leaderboards.avatar') }}</div>
                    <div class="leaderboards__item__name">{{ $t('leaderboards.name') }}</div>
                    <div class="leaderboards__item__value">{{ $t(board.valueLabel) }}</div>
                </div>

                <a v-for="leaderboard in board.stats"
                    :key="leaderboard.id"
                    :href="`${serverUrl}/public/character/${leaderboard.name}`"
                    target="_blank"
                    class="leaderboards__item"
                >
                    <avatar :head-style="leaderboard.headStyle"
                        :head-color="leaderboard.headColor"
                        :dye-color="leaderboard.dyeColor"
                        :gender="leaderboard.gender"
                        :job="leaderboard.jobName"
                        :framed="true"
                        :head-gears="[
                            leaderboard.head,
                            leaderboard.face,
                            leaderboard.mouth
                        ]"
                    />

                    <div class="leaderboards__item__name">
                        {{ leaderboard.name }}
                    </div>

                    <div class="leaderboards__item__value">
                        {{ leaderboard.value }}
                    </div>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import axios from 'axios';
import { mapGetters } from 'vuex';

// Components
import topNavigation from '@components/top-navigation/top-navigation.vue';
import loading from '@components/loading/loading.vue';
import avatar from '@components/avatar/avatar.vue';

const leaderboardsPage = {
    components: {
        avatar,
        loading,
        topNavigation
    },
    data() {
        return {
            loading: true,
            topJobsLeaderboards: {
                alchemist: [],
                blacksmith: [],
                fighter: [],
                thief: [],
                archer: [],
                mage: [],
                acolyte: []
            },
            otherLeaderboards: {
                monstersKilled: {
                    label: 'leaderboards.monstersKilled',
                    valueLabel: 'leaderboards.monstersKilledValue',
                    stats: []
                },
                zeny: {
                    label: 'leaderboards.richestPerson',
                    valueLabel: 'global.money',
                    stats: [],
                },
                quests: {
                    label: 'leaderboards.quests',
                    valueLabel: 'leaderboards.questsValue',
                    stats: [],
                },
                deaths: {
                    label: 'leaderboards.deaths',
                    valueLabel: 'leaderboards.deathsValue',
                    stats: [],
                },
                crafts: {
                    label: 'leaderboards.crafts',
                    valueLabel: 'leaderboards.craftsValue',
                    stats: [],
                }
            }
        };
    },
    computed: {
        ...mapGetters(['serverUrl'])
    },
    mounted() {
        this.getLeaderboards();
    },
    methods: {
        async getLeaderboards() {
            try {
                const response = await axios.get(`${mo.serverUrl}/api/leaderboards?cache=${new Date().getTime()}`);

                this.boardsBreakdown(response.data);

                this.loading = false;
            } catch (error) {
                this.$router.replace('/server-down');
            }
        },
        boardsBreakdown(leaderboards) {
            this.topJobsLeaderboards.fighter = leaderboards.filter((board) => board.board === 'topFighter');
            this.topJobsLeaderboards.thief = leaderboards.filter((board) => board.board === 'topThief');
            this.topJobsLeaderboards.archer = leaderboards.filter((board) => board.board === 'topArcher');
            this.topJobsLeaderboards.mage = leaderboards.filter((board) => board.board === 'topMage');
            this.topJobsLeaderboards.acolyte = leaderboards.filter((board) => board.board === 'topAcolyte');
            this.topJobsLeaderboards.alchemist = leaderboards.filter((board) => board.board === 'topAlchemist');
            this.topJobsLeaderboards.blacksmith = leaderboards.filter((board) => board.board === 'topBlacksmith');
            this.otherLeaderboards.zeny.stats = leaderboards.filter((board) => board.board === 'zeny');
            this.otherLeaderboards.monstersKilled.stats = leaderboards.filter((board) => board.board === 'monstersKilled');
            this.otherLeaderboards.quests.stats = leaderboards.filter((board) => board.board === 'quests');
            this.otherLeaderboards.deaths.stats = leaderboards.filter((board) => board.board === 'deaths');
            this.otherLeaderboards.crafts.stats = leaderboards.filter((board) => board.board === 'itemsCrafted');
        }
    }
};

// Routing
mo.routes.push({
    path: '/leaderboards',
    component: leaderboardsPage
});

export default leaderboardsPage;
</script>