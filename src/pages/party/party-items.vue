<template>
    <section class="party-page">
        <div class="heading">{{ member.name }} - {{ itemPart.name }} slot</div>

        <div v-if="Object.keys(member).length && itemList.length"
            class="items-list"
        >
            <div v-for="(item, index) in itemList"
                :key="index"
                class="item-block"
            >
                <div class="top-member-info item-block-info">
                    <div class="avatar"><span class="price">{{ item.value }}</span></div>

                    <div class="info">
                        <div class="level">{{ item.name }} / L{{ item.level }}</div>
                        <div class="params">{{ item.paramsStr }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>No items to display</p>
        </div>
    </section>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

// Configs
import classes from '../../../config/classes.json';

// Mixins
import classMixin from '../../mixins/class-mixin.js';
import itemMixin from '../../mixins/item-mixin.js';

// Component
import item from '../../components/item/item.vue';

const partyItemsPage = {
    components: {
        item
    },
    mixins: [classMixin, itemMixin],
    data() {
        return {
            id: this.$route.params.id,
            job: {},
            urlBack: '/party/' + this.$route.params.id,
            itemPart: this.getPartName(this.$route.params.item),
            itemList: []
        };
    },
    created() {
        // Allowed "dynamic" URLs
        const itemPartsWhiteList = ['head', 'body', 'rhand', 'lhand', 'pants', 'boots', 'racc', 'lacc'];

        // In case URL is incorrect, redirecting back to profile of a member
        if (itemPartsWhiteList.indexOf(this.$route.params.item) < 0) {
            this.$route.push(this.urlBack);

            return false;
        }
    },
    computed: {
        member() {
            const member = this.$store.getters.get('party')[this.$route.params.id] || {};

            return member;
        }
    },
    beforeDestroy() {
        /* 1 const member = this.$store.getters.get('party')[this.id];

        // Recalculating member stats
        member.stats.pow -= this.tempStats.pow;
        member.stats.wis -= this.tempStats.wis;
        member.stats.hea -= this.tempStats.hea;

        member.params = this.recalculateParams(member); */
    },
    watch: {
        member: {
            handler() {
                if (this.member.class) {
                    // Get job description and fetch allowed items
                    this.queryMemberData(this.member);

                    // Create a list of allowed items to display
                    this.getAllowedItems();
                }
            },
            immediate: true
        }
    },
    methods: {
        getPartName(part) {
            let returnPart = {};

            switch (part) {
                case 'head':
                    returnPart = {
                        name: 'Head',
                        types: ['hhelm', 'lhelm']
                    };
                    break;
                case 'body':
                    returnPart = {
                        name: 'Body',
                        types: ['hbody', 'lbody']
                    };
                    break;
                case 'rhand':
                    returnPart = {
                        name: 'Right Hand',
                        types: ['dagger', 'sword', '2hsword', 'bow', 'xbox', 'mace', 'axe', 'wand', 'staff']
                    };
                    break;
                case 'lhand':
                    returnPart = {
                        name: 'Left Hand',
                        types: ['shield']
                    };
                    break;
                case 'pants':
                    returnPart = {
                        name: 'Pants',
                        types: ['hpants', 'lpants']
                    };
                    break;
                case 'boots':
                    returnPart = {
                        name: 'Boots',
                        types: ['hboots', 'lboots']
                    };
                    break;
                case 'racc':
                    returnPart = {
                        name: 'Accessory (1)',
                        types: []
                    };
                    break;
                case 'lacc':
                    returnPart = {
                        name: 'Accessory (2)',
                        types: []
                    };
                    break;
                default:
                    returnPart = {
                        name: '-',
                        types: []
                    };
                    break;
            }

            return returnPart;
        },
        queryMemberData(member) {
            // Fetch member class data
            this.job = classes.find((job) => job.id === member.class);
        },
        getAllowedItems() {
            // Grab all items from storage
            const items = functions.storage('get', 'items');

            // Gather only items that are allowed for this class / level
            const gatherItems = [];

            for (const item of items) {
                const itemData = this.getItem(item);

                // Check if this item type is allowed for this type of class, if not, we're removing it from the list
                if (this.job.allowedItemsParts.indexOf(itemData.type) === -1) {
                    continue;
                }

                // Check which slot are we looking at, if this is a weapon display, we should hide armor and vice versa
                if (this.itemPart.types.indexOf(itemData.type) === -1) {
                    continue;
                }

                // Gathering params in a properly displayed string
                itemData.paramsStr = '';
                for (const [key, value] of Object.entries(itemData.params)) {
                    // In case parameter is positive, adding + to it, otherwise 0 or a negative number coming straight out of items.json
                    if (parseInt(value) > 0) {
                        itemData.paramsStr += `${key.toUpperCase()}: +${value}, `;
                    } else {
                        itemData.paramsStr += `${key.toUpperCase()}: ${value}, `;
                    }
                }
                // Removing last space and comma
                itemData.paramsStr = itemData.paramsStr.substring(0, itemData.paramsStr.length - 2);

                // In case item level is too high, we mark it as disabled, to still display it in the list, but make it unclickable
                if (itemData.level > this.member.level) {
                    itemData.disabled = 1;
                }

                // Add to displayed list of items
                gatherItems.push(itemData);
            }

            this.itemList = gatherItems;
        }
    }
};

// Routing
mo.routes.push({
    path: '/party/:id/:item',
    component: partyItemsPage
});

export default partyItemsPage;
</script>