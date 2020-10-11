<template>
    <div :class="{'craft--smithy': characterCrafting && craftData.type === 'weapon'}"
        class="craft"
    >
        <div v-if="loading"
            class="craft__wrapper"
        >
            <loading />
        </div>
        <div v-else-if="characterCrafting"
            class="craft__wrapper"
        >
            <div class="craft__in-progress">
                You are crafting <b>{{ craftData.name }} (Lv: {{ craftData.level }})</b> at the moment. Your chance for success is {{ craftData.successChance }}%.<br>
                <img :src="`/dist/assets/images/items/large/${craftData.itemId}.gif`">

                <div class="craft__in-progress__button">
                    <button class="btn btn-danger"
                        @click="cancelCraft()"
                    >Abandon craft process</button>
                    You can abandon your work, but you will not recover any materials and will not get any experience
                </div>
            </div>
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
                    <div class="craft__item__info__materials">Chance: {{ item.chance }}% | Time: {{ item.time / 60 }}m</div>
                    <div class="craft__item__info__chance">Reward: {{ item.reward[0] }} B.Exp, {{ item.reward[1] }} J.Exp</div>
                </div>
                <router-link :to="`/craft/${item.itemId}`"
                    class="craft__item__move"
                >
                    <i class="icon icon-anvil" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const craftPage = {
    components: {
        loading,
    },
    data() {
        return {
            loading: true,
            craftableItems: []
        };
    },
    computed: {
        ...mapGetters([
            'characterCrafting',
            'craftData'
        ])
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

        mo.socket.emit('getCraftItems');

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
    path: '/craft',
    component: craftPage
});

export default craftPage;
</script>