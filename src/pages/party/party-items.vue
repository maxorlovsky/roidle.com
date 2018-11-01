<template>
    <section class="party-page">
        <div class="heading">{{ member.name }} - {{ itemPart }} slot</div>

        <div v-if="Object.keys(member).length"
            class="items-list"
        >
            <div v-for="(item, index) in itemList"
                :key="index"
                class="item-block"
            >{{ item }}</div>
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
            itemPart: ''
        };
    },
    created() {
        const itemPartsWhiteList = ['head', 'body', 'rhand', 'lhand', 'pants', 'boots', 'racc', 'lacc'];

        // In case URL is incorrect, redirecting back to profile of a member
        if (itemPartsWhiteList.indexOf(this.$route.params.item) < 0) {
            this.$route.push(this.urlBack);
            return false;
        }

        this.itemPart = this.getPartName(this.$route.params.item);
    },
    computed: {
        member() {
            const member = this.$store.getters.get('party')[this.$route.params.id] || {};

            if (Object.keys(member).length) {
                this.getAllowedItems();
            }

            return member;
        }
    },
    beforeDestroy() {

        /* const member = this.$store.getters.get('party')[this.id];

        // Recalculating member stats
        member.stats.pow -= this.tempStats.pow;
        member.stats.wis -= this.tempStats.wis;
        member.stats.hea -= this.tempStats.hea;

        member.params = this.recalculateParams(member); */
    },
    methods: {
        getPartName(part) {
            let returnPart = '';

            switch (part) {
                case 'head':
                    returnPart = 'Head';
                    break;
                case 'body':
                    returnPart = 'Body';
                    break;
                case 'rhand':
                    returnPart = 'Right Hand';
                    break;
                case 'lhand':
                    returnPart = 'Left Hand';
                    break;
                case 'pants':
                    returnPart = 'Pants';
                    break;
                case 'boots':
                    returnPart = 'Boots';
                    break;
                case 'racc':
                    returnPart = 'Accessory (1)';
                    break;
                case 'lacc':
                    returnPart = 'Accessory (2)';
                    break;
                default:
                    returnPart = '-';
                    break;
            }

            return returnPart;
        },
        queryMemberData(member) {
            // Fetch member class data
            this.job = classes.find((job) => job.id === member.class);
            console.log(this.job);
        },
        getAllowedItems() {
            // Grab all items from storage
            const items = functions.storage('get', 'items');

            // Gather only items that are allowed for this class / level
            const gatherItems = [];
            console.log(this.member);
            for (const item of items) {
                const itemData = this.getItem(item);

                if (itemData.level <= this.member.level) {
                    gatherItems.push(itemData);
                }
            }

            this.itemList = gatherItems;
        },
        allocateStat(stat, increment) {
            if (increment) {
                // In case there is 0 stat points, we hold the increment
                if (!this.tempStats.points) {
                    return false;
                }

                // Increase temporary stat
                this.tempStats[stat]++;

                // Increase member stat
                this.member.stats[stat]++;

                // Decrease available points
                this.tempStats.points--;

                this.member.params = this.recalculateParams(this.member);

                return true;
            }

            // Otherwise decreasing
            // If temporary stat that we're decreasing is already on 0, we can't decrease more
            if (!this.tempStats[stat]) {
                return false;
            }

            // Decrease temporary stat
            this.tempStats[stat]--;

            // Decrease member stat
            this.member.stats[stat]--;

            // Increase available points
            this.tempStats.points++;

            this.member.params = this.recalculateParams(this.member);

            return true;
        },
        recalculateParams(member) {
            return this.getClassParams(member.class, member.stats);
        },
        confirmStats() {
            // Reseting temporary stats
            this.tempStats.pow = 0;
            this.tempStats.wis = 0;
            this.tempStats.hea = 0;

            // Removing used points
            this.member.statPoints -= (this.member.statPoints - this.tempStats.points);

            // Updating current HP to maximum
            this.member.hp = this.member.params.health;

            // Get clean data of party and update specific member
            const party = this.$store.getters.get('party');
            party[this.$route.params.id] = this.member;

            // Update party in vuex and storage
            this.$store.commit('saveParty', party);

            // Saving token in localStorage after how many days it should expire
            // 604800000 = 7 * 90 days
            functions.storage('set', 'party', party);
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