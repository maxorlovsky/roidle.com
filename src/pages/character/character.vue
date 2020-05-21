<template>
    <section class="character">
        <div class="equipment">
            <div class="equipment__left">
                <div v-for="eq in leftSlots"
                    :key="eq.slot"
                    :class="`equipment__slot equipment__${eq.slot}`"
                    @click="equimentList(eq.slot)"
                >
                    <div v-if="characterEquipment[eq.slot] && characterEquipment[eq.slot].itemId"
                        class="equipment__item"
                    >
                        <img :src="`/dist/assets/images/items/${characterEquipment[eq.slot].itemId}.gif`">
                        <span class="equipment__item__name">{{ characterEquipment[eq.slot].name }}</span>
                    </div>
                    <span class="equipment__placeholder">{{ eq.name }}</span>
                </div>
            </div>

            <div class="equipment__avatar">
                <avatar :head-style="characterHeadStyle"
                    :gender="characterGender"
                    :job="characterJob"
                    :head-gear="characterEquipment.head.itemId"
                />
            </div>

            <div class="equipment__left">
                <div v-for="eq in rightSlots"
                    :key="eq.slot"
                    :class="`equipment__slot equipment__${eq.slot}`"
                    @click="equimentList(eq.slot)"
                >
                    <div v-if="characterEquipment[eq.slot] && characterEquipment[eq.slot].itemId"
                        class="equipment__item"
                    >
                        <img :src="`/dist/assets/images/items/${characterEquipment[eq.slot].itemId}.gif`">
                        <span class="equipment__item__name">{{ characterEquipment[eq.slot].name }}</span>
                    </div>
                    <span class="equipment__placeholder">{{ eq.name }}</span>
                </div>
            </div>
        </div>

        <div v-if="showEquipmentModal"
            class="equipment-modal modal"
        >
            <div v-if="characterEquipment[slot].itemId"
                class="equipment-modal__item"
                @click="uneqipItem(slot)"
            >
                <img :src="`/dist/assets/images/cancel.png`">
                <span class="equipment-modal__item__amount">Unequip item</span>
            </div>

            <template v-if="items && items.length">
                <div v-for="(item, index) in items"
                    :key="index"
                    class="equipment-modal__item"
                    @click="equipItem(item.id, item.itemId)"
                >
                    <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                    <div class="equipment-modal__item__amount">
                        {{ item.name }}
                        <div>{{ itemClassNameCorrection(item.class, item.twoHanded) }}{{ itemDisplayParams(item.params) }}</div>
                    </div>
                </div>
            </template>
            <div v-else
                class="equipment-modal__item"
            >
                No items to equip
            </div>

            <div class="modal__buttons equipment-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showEquipmentModal = false"
                >Cancel</button>
            </div>
        </div>

        <stats />

        <button class="btn game-button btn-lg skills-button"
            @click="goToSkills()"
        >Skills</button>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '../../components/avatar/avatar.vue';
import stats from '../../components/stats/stats.vue';

const characterPage = {
    components: {
        avatar,
        stats
    },
    data() {
        return {
            maxHp: 0,
            maxMp: 0,
            showEquipmentModal: false,
            items: [],
            slot: '',
            equipment: {
                head: null,
                face: null,
                mouth: null,
                body: null,
                rhand: null,
                lhand: null,
                robe: null,
                shoes: null,
                acc1: null,
                acc2: null
            },
            leftSlots: [
                {
                    slot: 'head',
                    name: 'head'
                },
                {
                    slot: 'mouth',
                    name: 'mouth'
                },
                {
                    slot: 'rhand',
                    name: 'R-hand'
                },
                {
                    slot: 'garment',
                    name: 'robe'
                },
                {
                    slot: 'acc1',
                    name: 'accessory'
                }
            ],
            rightSlots: [
                {
                    slot: 'face',
                    name: 'face'
                },
                {
                    slot: 'body',
                    name: 'body'
                },
                {
                    slot: 'lhand',
                    name: 'L-hand'
                },
                {
                    slot: 'footgear',
                    name: 'shoes'
                },
                {
                    slot: 'acc2',
                    name: 'accessory'
                }
            ]
        };
    },
    computed: {
        ...mapGetters([
            'characterHeadStyle',
            'characterGender',
            'characterEquipment',
            'characterJob',
            'inventory'
        ])
    },
    mounted() {
        mo.socket.on('getEquipableItemsComplete', (response) => {
            if (response) {
                this.items = response.equipableItems;

                this.showEquipmentModal = true;
            } else {
                this.$store.commit('sendChat', [
                    {
                        type: '#system',
                        character: 'System',
                        message: 'Error retrieving equipable items'
                    }
                ]);
            }
        });

        // Hiding chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('getEquipableItemsComplete');

        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        itemDisplayParams(params) {
            let paramsString = ', ';

            if (params) {
                for (const key of Object.keys(params)) {
                    paramsString += `${this.attributeNameCorrection(key)} ${params[key]}`;
                }
            }

            // Check if params are empty
            if (paramsString === ', ') {
                paramsString = '';
            }

            return paramsString;
        },
        attributeNameCorrection(name) {
            switch (name) {
                case 'patk':
                    return 'P.Atk';
                case 'matk':
                    return 'M.Atk';
                case 'pdef':
                    return 'P.Def';
                case 'mdef':
                    return 'M.Def';
                case 'maxHp':
                    return 'M.HP';
                case 'maxMp':
                    return 'M.MP';
                default:
                    return name.charAt(0).toUpperCase() + name.slice(1);
            }
        },
        itemClassNameCorrection(name, twoHanded = false) {
            if (name === 'sword' && twoHanded) {
                return 'Two-handed Sword';
            }

            return name.charAt(0).toUpperCase() + name.slice(1);
        },
        uneqipItem(slot) {
            // Triggering equip of an item on server
            mo.socket.emit('unequipItem', {
                slot: slot
            });

            this.showEquipmentModal = false;
        },
        equipItem(id, itemId) {
            // Triggering equip of an item on server
            mo.socket.emit('equipItem', {
                id,
                itemId,
                slot: this.slot
            });

            this.showEquipmentModal = false;
        },
        equimentList(slot) {
            // Reset items
            this.items = [];
            this.showEquipmentModal = false;
            // Saving slot for future reference
            this.slot = slot;

            mo.socket.emit('getEquipableItems', slot);
        },
        goToSkills() {
            this.$router.push('/character/skills');
        }
    }
};

// Routing
mo.routes.push({
    path: '/character',
    component: characterPage
});

export default characterPage;
</script>