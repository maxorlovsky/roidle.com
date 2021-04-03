<template>
    <div class="leaderboards">
        <top-navigation />

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
                        :dye-color="leaderboard.dyeStyle"
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

            <div class="leaderboards__board">
                <h2>{{ $t('leaderboards.monstersKilled') }}</h2>

                <div class="leaderboards__item leaderboards__titles">
                    <div class="leaderboards__item__avatar">{{ $t('leaderboards.avatar') }}</div>
                    <div class="leaderboards__item__name">{{ $t('leaderboards.name') }}</div>
                    <div class="leaderboards__item__value">{{ $t('leaderboards.monstersKilled') }}</div>
                </div>

                <a v-for="leaderboard in topMonstersKilled"
                    :key="leaderboard.id"
                    :href="`${serverUrl}/public/character/${leaderboard.name}`"
                    target="_blank"
                    class="leaderboards__item"
                >
                    <avatar :head-style="leaderboard.headStyle"
                        :head-color="leaderboard.headColor"
                        :dye-color="leaderboard.dyeStyle"
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

            <div class="leaderboards__board">
                <h2>{{ $t('leaderboards.richestPerson') }}</h2>

                <div class="leaderboards__item leaderboards__titles">
                    <div class="leaderboards__item__avatar">{{ $t('leaderboards.avatar') }}</div>
                    <div class="leaderboards__item__name">{{ $t('leaderboards.name') }}</div>
                    <div class="leaderboards__item__value">{{ $t('global.money') }}</div>
                </div>

                <a v-for="leaderboard in topZeny"
                    :key="leaderboard.id"
                    :href="`${serverUrl}/public/character/${leaderboard.name}`"
                    target="_blank"
                    class="leaderboards__item"
                >
                    <avatar :head-style="leaderboard.headStyle"
                        :head-color="leaderboard.headColor"
                        :dye-color="leaderboard.dyeStyle"
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
                fighter: [],
                thief: [],
                archer: [],
                mage: [],
                acolyte: [],
                merchant: []
            },
            topMonstersKilled: [],
            topZeny: []
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
                const response = await axios.get(`${mo.serverUrl}/api/leaderboards`);

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
            this.topJobsLeaderboards.merchant = leaderboards.filter((board) => board.board === 'topMerchant');
            this.topMonstersKilled = leaderboards.filter((board) => board.board === 'monstersKilled');
            this.topZeny = leaderboards.filter((board) => board.board === 'zeny');
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