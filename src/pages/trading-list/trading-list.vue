<template>
    <section class="trading-list">
        <div class="trading-list__empty">
            <p>{{ $t('trade.playersTradingList') }}</p>

            <loading v-if="loading" />

            <div v-if="!loading && !usersList.length"
                class="trading-list__empty__text"
            >
                {{ $t('trade.noPlayersOnLocation') }}
            </div>
            <div v-else
                class="trading-list__characters"
            >
                <div v-for="user in usersList"
                    :key="user.name"
                    class="trading-list__character"
                >
                    <avatar :head-style="user.headStyle"
                        :head-color="user.headColor"
                        :dye-color="user.dyeColor"
                        :head-gears="user.headGears"
                        :gender="user.gender"
                        :job="user.job"
                        :framed="true"
                    />

                    <div class="trading-list__character__info">
                        {{ user.name }} ({{ user.baseLevel }}/{{ user.jobLevel }})<br>
                        {{ user.job }}
                    </div>

                    <div class="trading-list__character__buttons">
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="viewCharacter(user.name)"
                        >{{ $t('global.viewProfile') }}</button>
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="trade(user.name)"
                        >{{ $t('global.trade') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
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
            this.$router.push(`/profile/${name}`);
        },
        trade(name) {
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