<template>
    <div class="craft">
        <div v-if="characterCrafting"
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
                <div class="craft__item__image-amount">
                    <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                </div>
                <div class="craft__item__info">
                    <div class="craft__item__info__name">{{ item.name }}</div>
                </div>
                <router-link :to="`/craft/${item.type}`"
                    class="craft__item__move"
                >
                    &gt;
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

const craftPage = {
    data() {
        return {
            craftableItems: [
                {
                    itemId: 1101,
                    type: 'sword',
                    name: 'Swords'
                },
                {
                    itemId: 1116,
                    type: '2hsword',
                    name: '2-handed Swords'
                },
                {
                    itemId: 1201,
                    type: 'knife',
                    name: 'Daggers'
                },
                {
                    itemId: 1301,
                    type: 'axe',
                    name: 'Axes'
                },
                {
                    itemId: 1351,
                    type: '2haxe',
                    name: '2-handed Axes'
                },
                {
                    itemId: 1504,
                    type: 'mace',
                    name: 'Maces'
                },
                {
                    itemId: 2101,
                    type: 'shield',
                    name: 'Shields'
                },
                {
                    itemId: 2220,
                    type: 'head',
                    name: 'Headgears'
                },
                {
                    itemId: 2305,
                    type: 'body',
                    name: 'Body Armors'
                },
                {
                    itemId: 2403,
                    type: 'footgear',
                    name: 'Footwear'
                },
                {
                    itemId: 2501,
                    type: 'garment',
                    name: 'Garments'
                }
            ]
        };
    },
    computed: {
        ...mapGetters([
            'characterCrafting',
            'craftData'
        ])
    },
    mounted() {
        // Hide chat
        this.$store.commit('showChat', false);
    }
};

// Routing
mo.routes.push({
    path: '/craft',
    component: craftPage
});

export default craftPage;
</script>