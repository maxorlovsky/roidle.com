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
                    @click.exact="showItemInfo(item)"
                    @click.ctrl="parseItemToChat(item.name)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                </div>
                <div class="craft__item__info">
                    <div :class="{'craft__item__info__name--low-level': notAvailable(item)}"
                        class="craft__item__info__name"
                    >
                        {{ item.name }} <template v-if="item.outputAmount > 1">(x{{ item.outputAmount }}) </template>({{ $t('craft.requiredLevel') }}: {{ item.level }})
                    </div>
                    <div class="craft__item__info__materials">{{ $t('craft.chance') }}: {{ item.chance }}% | {{ $t('craft.time') }}: {{ staticTimer(item.time) }} | {{ $t('global.mpCost') }}: {{ item.mpCost }}</div>
                    <div class="craft__item__info__chance">{{ $t('craft.reward') }}: {{ item.reward[0] }} {{ $t('global.bexp') }}, {{ item.reward[1] }} {{ $t('global.jexp') }}</div>
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
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

// Mixins
import timerMixin from '@mixins/timers.js';
import chatMixin from '@mixins/chat.js';

const craftType = {
    components: {
        loading,
    },
    mixins: [timerMixin, chatMixin],
    data() {
        return {
            loading: true,
            craftableItems: []
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'characterBaseLevel',
            'serverUrl'
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

        mo.socket.emit('getCraftItems', this.$route.params.type);
    },
    beforeDestroy() {
        mo.socket.off('getCraftItemsComplete');
    },
    methods: {
        notAvailable(item) {
            if (item.level > this.characterBaseLevel) {
                return true;
            }

            if (item.category === 'weapon' && this.characterSkills[29] >= 1) {
                return false;
            }

            if (item.category === 'armor' && this.characterSkills[30] >= 1) {
                return false;
            }

            if (item.category === 'ammunition' && this.characterSkills[31] >= 1) {
                return false;
            }

            if (item.category === 'alchemy' && this.characterSkills[36] >= 1) {
                return false;
            }

            return true;
        },
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