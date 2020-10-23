<template>
    <section class="trading-list">
        <div class="trading-list__empty">
            <p>Player trading list</p>

            <loading v-if="loading" />

            <div v-if="!loading && !usersList.length"
                class="trading-list__empty__text"
            >
                No players on the location to trade
            </div>
            <div v-else
                class="trading-list__characters"
            >
                <div v-for="item in usersList"
                    :key="item.name"
                    class="trading-list__character"
                >
                    <avatar :head-style="item.headStyle"
                        :head-color="item.headColor"
                        :head-gears="item.headGears"
                        :gender="item.gender"
                        :job="item.job"
                        :framed="true"
                    />

                    <div class="trading-list__character__info">
                        {{ item.name }} ({{ item.baseLevel }}/{{ item.jobLevel }})<br>
                        {{ item.job }}
                    </div>

                    <div class="trading-list__character__buttons">
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="viewCharacter(item.name)"
                        >View profile</button>
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="trade(item.name)"
                        >Trade</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '@components/avatar/avatar.vue';
import loading from '@components/loading/loading.vue';

const tradingListPage = {
    components: {
        avatar,
        loading
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            usersList: [],
        };
    },
    computed: {
        ...mapGetters([
            'characterHeadStyle',
            'characterHeadColor',
            'characterGender',
            'characterSkills'
        ])
    },
    mounted() {
        mo.socket.on('getListForTradingComplete', (response) => {
            this.usersList = response;
            this.loading = false;
        });

        mo.socket.on('updateGetListForTrading', () => {
            mo.socket.emit('getListForTrading');
        });

        mo.socket.emit('getListForTrading');
    },
    beforeDestroy() {
        mo.socket.off('getListForTradingComplete');
    },
    methods: {
        viewCharacter(name) {
            this.buttonLoading = true;

            this.$router.push(`/profile/${name}`);
        },
        trade(name) {
            this.buttonLoading = true;

            mo.socket.emit('initiateTrading', name);
        }
    }
};

// Routing
mo.routes.push({
    path: '/trading-list',
    component: tradingListPage
});

export default tradingListPage;
</script>