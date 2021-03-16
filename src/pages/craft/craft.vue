<template>
    <div class="craft">
        <div v-if="characterCrafting && craftData"
            class="craft__wrapper"
        >
            <div class="craft__in-progress">
                {{ $t('craft.youAreCrafting') }} <b>{{ craftData.name }} ({{ $t('global.shortLevel') }}: {{ craftData.level }})</b> <span v-if="craftData.amount > 1">(x{{ craftData.amount }})</span> {{ $t('craft.youAreCrafting2') }} {{ craftData.successChance }}%.<br>
                <img :src="`${serverUrl}/dist/assets/images/items/large/${craftData.itemId}.gif`">

                <div class="craft__in-progress__button">
                    <button class="btn btn-danger"
                        @click="cancelCraft()"
                    >{{ $t('craft.abandonCraft') }}</button>
                    {{ $t('craft.abandonCraftExplanation') }}
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
                    <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                </div>
                <div class="craft__item__info">
                    <div class="craft__item__info__name">{{ item.name }}</div>
                </div>
                <router-link :to="`/craft-type/${item.type}`"
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
                    name: this.$t('craft.swords')
                },
                {
                    itemId: 1116,
                    type: '2hsword',
                    name: this.$t('craft.2hswords')
                },
                {
                    itemId: 1201,
                    type: 'knife',
                    name: this.$t('craft.daggers')
                },
                {
                    itemId: 1301,
                    type: 'axe',
                    name: this.$t('craft.axes')
                },
                {
                    itemId: 1351,
                    type: '2haxe',
                    name: this.$t('craft.2haxes')
                },
                {
                    itemId: 1504,
                    type: 'mace',
                    name: this.$t('craft.maces')
                },
                {
                    itemId: 1604,
                    type: 'staff',
                    name: this.$t('craft.staffs')
                },
                {
                    itemId: 1701,
                    type: 'bow',
                    name: this.$t('craft.bows')
                },
                {
                    itemId: 2101,
                    type: 'shield',
                    name: this.$t('craft.shields')
                },
                {
                    itemId: 2220,
                    type: 'head',
                    name: this.$t('craft.headgears')
                },
                {
                    itemId: 2305,
                    type: 'body',
                    name: this.$t('craft.bodyArmors')
                },
                {
                    itemId: 2403,
                    type: 'footgear',
                    name: this.$t('craft.footwear')
                },
                {
                    itemId: 2501,
                    type: 'garment',
                    name: this.$t('craft.garments')
                },
                {
                    itemId: 1750,
                    type: 'arrow',
                    name: this.$t('craft.arrows')
                },
                {
                    itemId: 501,
                    type: 'potions',
                    name: this.$t('craft.healingPotions')
                }
            ]
        };
    },
    computed: {
        ...mapGetters([
            'characterCrafting',
            'craftData',
            'serverUrl'
        ])
    }
};

// Routing
mo.routes.push({
    path: '/craft',
    component: craftPage
});

export default craftPage;
</script>