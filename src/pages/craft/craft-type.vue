<template>
    <div class="craft craft-type">
        <div v-if="loading"
            class="craft__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="craft__wrapper"
        >
            <div v-for="(item, index) in craftableItems"
                :key="index"
                class="craft__item"
            >
                <div class="craft__item__image-amount"
                    @click="showItemInfo(item)"
                >
                    <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                </div>
                <div class="craft__item__info">
                    <div class="craft__item__info__name">{{ item.name }} (Lv: {{ item.level }})</div>
                    <div class="craft__item__info__materials">Chance: {{ item.chance }}% | Time: {{ Math.floor(item.time / 60) }}m</div>
                    <div class="craft__item__info__chance">Reward: {{ item.reward[0] }} B.Exp, {{ item.reward[1] }} J.Exp</div>
                </div>
                <router-link :to="`/craft-item/${item.itemId}`"
                    class="craft__item__move"
                >
                    <i class="icon icon-anvil" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
// Components
import loading from '@components/loading/loading.vue';

const craftType = {
    components: {
        loading,
    },
    data() {
        return {
            loading: true,
            craftableItems: []
        };
    },
    mounted() {
        mo.socket.on('getCraftItemsComplete', (response) => {
            if (response.status) {
                this.loading = false;
                this.craftableItems = response.craftableItems;
            } else {
                // In case response is not true, then user is not even suppose to be here
                this.$router.push('/game');
            }
        });

        mo.socket.emit('getCraftItems', this.$route.params.type);

        // Hide chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('getCraftItemsComplete');
    },
    methods: {
        cancelCraft() {
            mo.socket.emit('cancelCraft');
        },
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId
            });
        }
    }
};

// Routing
mo.routes.push({
    path: '/craft-type/:type',
    component: craftType
});

export default craftType;
</script>