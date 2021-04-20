<template>
    <div :class="{
        'item-block--broken': item.broken,
        'item-block--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
        'item-block--high-quality': item.durability && item.durability > item.defaultDurability
    }"
        class="item-block"
        @click.exact="getInfo(item)"
        @click.ctrl="parseItemToChat(item.itemName, item.name)"
    >
        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
        <span v-if="item.maxDurability"
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
        }
    },
    data() {
        return {};
    },
    computed: {
        ...mapGetters(['serverUrl'])
    },
    methods: {
        getInfo(item) {
            if (!this.showItemInfo) {
                return false;
            }

            mo.socket.emit('getItemInfo', {
                itemId: item.itemId
            });
        }
    }
};
</script>