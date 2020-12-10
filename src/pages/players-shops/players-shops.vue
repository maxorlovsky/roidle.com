<template>
    <section class="players-shops">
        <div v-if="loading"
            class="players-shops__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="players-shops__wrapper"
        >
            <div class="players-shops__title">{{ $t('shop.merchantsShops') }} ({{ shops.length }})</div>

            <div class="players-shops__list">
                <router-link v-if="haveShop"
                    :to="`/players-shops/manage/${haveShop}`"
                    class="btn btn-lg game-button players-shops__list__add"
                >{{ $t('shop.manageShop') }}</router-link>
                <router-link v-else-if="canOpenShop"
                    :to="'/players-shops/open'"
                    class="btn btn-lg game-button players-shops__list__add"
                >{{ $t('shop.openOwnShop') }}</router-link>

                <template v-if="shops.length">
                    <div v-for="(item, index) in shops"
                        :key="index"
                        class="players-shops__list__item"
                    >
                        <div class="players-shops__list__item__image">
                            <div v-if="item.image" />
                            <div v-else
                                class="players-shops__list__item__image__no-image"
                            >
                                <img :src="`${serverUrl}/dist/assets/images/items/672.gif`">
                            </div>
                        </div>

                        <div class="players-shops__list__item__info">
                            <div class="players-shops__list__item__info__name">{{ item.name }}</div>
                            <div class="players-shops__list__item__info__description">{{ item.description }}</div>
                        </div>

                        <div class="players-shops__list__item__info__buttons">
                            <router-link :to="`/players-shops/view/${item.id}`"
                                class="btn game-button"
                            >{{ $t('shop.enterShop') }}</router-link>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="players-shops__list__empty">{{ $t('shop.marketIsEmpty') }}</div>
                </template>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const playersShopsPage = {
    components: {
        loading,
    },
    data() {
        return {
            loading: true,
            shops: [],
            haveShop: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'serverUrl'
        ]),

        canTrade() {
            // Check if Basic skill level is higher or equals 4
            return this.characterSkills[1] >= 4;
        },
        canOpenShop() {
            // Check if Vending skill level is higher or equals 1
            return this.characterSkills[26] >= 1;
        }
    },
    watch: {
    },
    mounted() {
        mo.socket.on('getShopsListComplete', (response) => {
            this.loading = false;
            this.shops = response.shops;

            if (response.personalShopId) {
                this.haveShop = response.personalShopId;
            }
        });

        mo.socket.emit('getShopsList');
    },
    beforeDestroy() {
        mo.socket.off('getShopsListComplete');
    }
};

// Routing
mo.routes.push({
    path: '/players-shops',
    component: playersShopsPage
});

export default playersShopsPage;
</script>