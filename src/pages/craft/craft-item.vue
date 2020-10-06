<template>
    <div class="craft">
        <div v-if="loading"
            class="craft__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="craft__wrapper"
        >
            <div class="craft__item">
                <div class="craft__item__image-amount"
                    @click="showItemInfo(craftableItem.itemId)"
                >
                    <img :src="`/dist/assets/images/items/${craftableItem.itemId}.gif`">
                </div>
                <div class="craft__item__info">
                    <div class="craft__item__info__name">{{ craftableItem.name }} (Lv: {{ craftableItem.level }})</div>
                </div>

                <div class="craft__item__materials">
                    <div class="craft__item__materials__title">Materials</div>
                    <div v-for="material in craftableItem.craftMaterials"
                        :key="material.id"
                        class="craft__item__materials__material"
                        @click="showItemInfo(material.id)"
                    >
                        <img :src="`/dist/assets/images/items/${material.id}.gif`">
                    </div>
                </div>

                <div class="craft__item__time">Time: {{ craftableItem.time / 60 }}m</div>
                <div class="craft__item__chance">Chance: 0%</div>
                <div class="craft__item__reward">Reward: {{ craftableItem.reward[0] }} B.Exp, {{ craftableItem.reward[1] }} J.Exp</div>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const craftItemPage = {
    components: {
        loading,
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            craftableItem: null
        };
    },
    computed: {
        ...mapGetters(['characterSkills'])
    },
    mounted() {
        // In case itemId parameter not found redirecting user to main game page, normally should not happen at all
        if (!this.$route.params.itemId) {
            this.$router.push('/game');
        }

        mo.socket.on('getCraftItemComplete', (response) => {
            if (response.status) {
                this.loading = false;
                this.craftableItem = response.craftableItem;
            } else {
                // In case response is not true, then user is not even suppose to be here
                this.$router.push('/game');
            }
        });

        mo.socket.emit('getCraftItem', this.$route.params.itemId);
    },
    beforeDestroy() {
        mo.socket.off('getCraftItemComplete');
    },
    methods: {
        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        craftItem() {
            this.buttonLoading = true;
        }
    }
};

// Routing
mo.routes.push({
    path: '/craft/:itemId',
    component: craftItemPage
});

export default craftItemPage;
</script>