<template>
    <div class="item">
        <div v-if="!displayItem">-</div>
        <div v-else>{{ getItem(item).name }}</div>
    </div>
</template>

<script>
// Mixins
import itemMixin from '../../mixins/item-mixin.js';

export default {
    name: 'item',
    mixins: [itemMixin],
    props: {
        item: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            displayItem: false
        };
    },
    watch: {
        item: {
            immediate: true,
            handler() {
                if (!this.item) {
                    return false;
                }

                this.displayItem = true;

                console.log(this.getItem(this.item));
            }
        }
    }
}
</script>