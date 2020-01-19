// Configs
import items from '../../config/items.json';

export default {
    getItem(itemId) {
        const foundItem = items.find((item) => item.id === itemId);

        if (!foundItem) {
            console.error(`[ERROR] Item with id ${itemId} not found`);

            return false;
        }

        return foundItem;
    },
    getCurrentWeight(inventory) {
        let weight = 0;

        for (const item of inventory) {
            const foundItem = this.getItem(item.id);

            weight += foundItem.weight * item.amount;
        }

        return weight;
    }
};