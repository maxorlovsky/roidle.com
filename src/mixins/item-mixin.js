// Configs
import items from '../../config/items.json';

const itemMixin = {
    methods: {
        getItem(itemId) {
            const item = items.find((obj) => obj.id === itemId);

            // Checking if stats parameter exist
            if (!item.stats) {
                item.stats = {};
            }

            // Adding stats if missing
            item.stats.pow = item.stats.pow || 0;
            item.stats.wis = item.stats.wis || 0;
            item.stats.hea = item.stats.hea || 0;

            // Checking if params parameter exist
            if (!item.params) {
                item.params = {};
            }

            // Checking for params data, if there is none, add blank 0
            item.params.atk = item.params.atk || 0;
            item.params.matk = item.params.matk || 0;
            item.params.acc = item.params.acc || 0;
            item.params.crit = item.params.crit || 0;
            item.params.def = item.params.def || 0;
            item.params.mdef = item.params.mdef || 0;
            item.params.health = item.params.health || 0;

            // Return item
            return item;
        }
    }
};

export default itemMixin;