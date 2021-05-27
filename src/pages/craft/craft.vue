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

            <div v-if="showCancelModal"
                class="craft__cancel"
            >
                <div class="craft__cancel__caution-text">{{ $t('craft.confirmationToCancel') }}</div>
                <button class="btn btn-secondary"
                    @click="showCancelModal = false"
                >{{ $t('global.no') }}</button>
                <button class="btn btn-danger"
                    @click="confirmCancelCraft()"
                >{{ $t('global.yes') }}</button>
            </div>
        </div>
        <div v-else
            class="craft__wrapper"
        >
            <div class="craft--mobile">
                <div v-for="(item, index) in craftableItems"
                    :key="index"
                    class="craft__item"
                >
                    <div class="craft__item__image-amount">
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                    </div>
                    <div class="craft__item__info">
                        <div :class="{'craft__item__info__name--not-available': notAvailable(item.category)}"
                            class="craft__item__info__name"
                        >{{ item.name }}</div>
                    </div>
                    <router-link :to="`/craft-type/${item.type}`"
                        class="craft__item__move"
                    >
                        &gt;
                    </router-link>
                </div>
            </div>
            <div class="craft--desktop">
                <p class="craft__title">{{ title }}</p>

                <router-link v-for="(item, index) in craftableItems"
                    :key="index"
                    :to="`/craft-type/${item.type}`"
                    :class="{'craft__item--not-available': notAvailable(item.category)}"
                    class="craft__item"
                >
                    <div class="craft__item__image-amount">
                        <img :src="`${serverUrl}/dist/assets/images/items/large/${item.itemId}.gif`">
                    </div>
                    <div class="craft__item__info">
                        <div class="craft__item__info__name">{{ item.name }}</div>
                    </div>
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
            showCancelModal: false,
            title: '',
            craftableItems: [
                {
                    itemId: 1101,
                    category: 'weapon',
                    type: 'sword',
                    name: this.$t('craft.swords')
                },
                {
                    itemId: 1116,
                    category: 'weapon',
                    type: '2hsword',
                    name: this.$t('craft.2hswords')
                },
                {
                    itemId: 1201,
                    category: 'weapon',
                    type: 'knife',
                    name: this.$t('craft.daggers')
                },
                {
                    itemId: 1351,
                    category: 'weapon',
                    type: '2haxe',
                    name: this.$t('craft.2haxes')
                },
                {
                    itemId: 1504,
                    category: 'weapon',
                    type: 'mace',
                    name: this.$t('craft.maces')
                },
                {
                    itemId: 1604,
                    category: 'weapon',
                    type: 'staff',
                    name: this.$t('craft.staffs')
                },
                {
                    itemId: 1701,
                    category: 'weapon',
                    type: 'bow',
                    name: this.$t('craft.bows')
                },
                {
                    itemId: 2101,
                    category: 'armor',
                    type: 'shield',
                    name: this.$t('craft.shields')
                },
                {
                    itemId: 2220,
                    category: 'armor',
                    type: 'head',
                    name: this.$t('craft.headgears')
                },
                {
                    itemId: 2305,
                    category: 'armor',
                    type: 'body',
                    name: this.$t('craft.bodyArmors')
                },
                {
                    itemId: 2403,
                    category: 'armor',
                    type: 'footgear',
                    name: this.$t('craft.footwear')
                },
                {
                    itemId: 2501,
                    category: 'armor',
                    type: 'garment',
                    name: this.$t('craft.garments')
                },
                {
                    itemId: 1750,
                    category: 'ammunition',
                    type: 'arrow',
                    name: this.$t('craft.arrows')
                },
                {
                    itemId: 501,
                    category: 'alchemy',
                    type: 'potions',
                    name: this.$t('craft.healingPotions')
                },
                {
                    itemId: 974,
                    category: 'alchemy',
                    type: 'tonics',
                    name: this.$t('craft.tonics')
                }
            ]
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'characterCrafting',
            'craftData',
            'serverUrl'
        ])
    },
    mounted() {
        if (this.$route.params.type === 'smithy') {
            this.craftableItems = this.craftableItems.filter((craftCategory) => ['weapon', 'armor', 'ammunition'].includes(craftCategory.category));
            this.title = this.$t('craft.smithy');
        } else {
            this.craftableItems = this.craftableItems.filter((craftCategory) => ['alchemy'].includes(craftCategory.category));
            this.title = this.$t('craft.laboratory');
        }
    },
    methods: {
        notAvailable(category) {
            if (category === 'weapon' && this.characterSkills[29] >= 1) {
                return false;
            }

            if (category === 'armor' && this.characterSkills[30] >= 1) {
                return false;
            }

            if (category === 'ammunition' && this.characterSkills[31] >= 1) {
                return false;
            }

            if (category === 'alchemy' && this.characterSkills[36] >= 1) {
                return false;
            }

            return true;
        },
        confirmCancelCraft() {
            mo.socket.emit('cancelCraft');
            this.showCancelModal = false;
        },
        cancelCraft() {
            this.showCancelModal = true;
        },
    }
};

// Routing
mo.routes.push({
    path: '/craft/:type',
    component: craftPage
});

export default craftPage;
</script>