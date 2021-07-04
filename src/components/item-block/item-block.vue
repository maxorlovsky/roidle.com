<template>
    <div :class="{
        'item-block--broken': item.broken,
        'item-block--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
        'item-block--high-quality': item.durability && item.durability > item.defaultDurability,
        'item-block--disabled': disabled
    }"
        class="item-block"
        @click.exact="getInfo(item)"
        @click.ctrl="parseItemToChat(item.itemName, item.name)"
    >
        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
        <div v-if="displayItemAmount"
            :class="{'item-block__amount--not-found': !inventory.find((lookUpItem) => lookUpItem.itemId === item.itemId && lookUpItem.amount >= displayItemAmount)}"
            class="item-block__amount"
        >{{ userItemAmount(item.itemId) }}/{{ displayItemAmount }}</div>
        <span v-else-if="item.maxDurability"
            class="item-block__amount"
        >{{ item.durability }}/{{ item.maxDurability }}</span>
        <span v-else
            class="item-block__amount"
        >{{ item.amount }}</span>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Mixins
import chatMixin from '@mixins/chat.js';

export default {
    name: 'item-block',
    mixins: [chatMixin],
    props: {
        item: {
            type: Object,
            required: true
        },
        showItemInfo: {
            type: Boolean,
            default: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        displayItemAmount: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'inventory',
            'serverUrl'
        ])
    },
    methods: {
        /**
         * Display materials available in the user inventory
         *
         * @param {number} itemId Item ID
         * @returns {number} Returns amount from inventory
         */
        userItemAmount(itemId) {
            const findItem = this.inventory.find((item) => item.itemId === itemId);

            if (!findItem) {
                return 0;
            }

            return findItem.amount;
        },
        getInfo(item) {
            if (!this.showItemInfo) {
                return false;
            }

            const getItemInfoParams = {
                itemId: item.itemId
            };

            if (item.shopItemId) {
                getItemInfoParams.shopItemId = item.shopItemId;
            }

            mo.socket.emit('getItemInfo', getItemInfoParams);
        }
    }
};
</script>