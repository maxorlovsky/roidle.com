<template>
    <section class="character">
        <div class="equipment">
            <div class="equipment__left">
                <div v-for="eq in leftSlots"
                    :key="eq.slot"
                    :class="`equipment__slot equipment__${eq.slot}`"
                >
                    <div class="equipment__slot--clicker"
                        @click="equimentList(eq.slot)"
                    />
                    <div v-if="characterEquipment[eq.slot] && characterEquipment[eq.slot].itemId"
                        class="equipment__item"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${characterEquipment[eq.slot].itemId}.gif`">
                        <span class="equipment__item__name">{{ characterEquipment[eq.slot].name }}</span>
                    </div>
                    <span class="equipment__placeholder">{{ eq.name }}</span>
                    <div v-if="characterEquipment[eq.slot] && characterEquipment[eq.slot].itemId"
                        class="equipment__info"
                        @click.prevent="showItemInfo(characterEquipment[eq.slot])"
                    >?</div>
                </div>
            </div>

            <div class="equipment__avatar">
                <avatar :head-style="characterHeadStyle"
                    :head-color="characterHeadColor"
                    :gender="characterGender"
                    :job="characterJob"
                    :head-gears="[
                        characterEquipment.head.itemId,
                        characterEquipment.face.itemId,
                        characterEquipment.mouth.itemId
                    ]"
                />
            </div>

            <div class="equipment__left">
                <div v-for="eq in rightSlots"
                    :key="eq.slot"
                    :class="`equipment__slot equipment__${eq.slot}`"
                >
                    <div class="equipment__slot--clicker"
                        @click="equimentList(eq.slot)"
                    />
                    <div v-if="characterEquipment[eq.slot] && characterEquipment[eq.slot].itemId"
                        class="equipment__item"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${characterEquipment[eq.slot].itemId}.gif`">
                        <span class="equipment__item__name">{{ characterEquipment[eq.slot].name }}</span>
                    </div>
                    <span class="equipment__placeholder">{{ eq.name }}</span>
                    <div v-if="characterEquipment[eq.slot] && characterEquipment[eq.slot].itemId"
                        class="equipment__info"
                        @click.prevent="showItemInfo(characterEquipment[eq.slot])"
                    >?</div>
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
                <img :src="`${serverUrl}/dist/assets/images/cancel.png`">
                <span class="equipment-modal__item__amount">{{ $t('character.unequipItem') }}</span>
            </div>

            <template v-if="items && items.length">
                <div v-for="(item, index) in items"
                    :key="index"
                    class="equipment-modal__item"
                    @click="equipItem(item)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                    <div class="equipment-modal__item__amount">
                        {{ item.name }}
                        <div>{{ itemClassNameCorrection(item.class, item.twoHanded) }}{{ itemDisplayParams(item.params) }}</div>
                    </div>
                </div>
            </template>
            <div v-else
                class="equipment-modal__item"
            >
                {{ $t('character.noItemsToEquip') }}
            </div>

            <div class="modal__buttons equipment-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showEquipmentModal = false"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>

        <stats />

        <button class="btn game-button btn-lg skills-button"
            @click="goToSkills()"
        >{{ $t('character.skills') }}</button>
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
                    name: this.$t('equipment.head')
                },
                {
                    slot: 'mouth',
                    name: this.$t('equipment.mouth')
                },
                {
                    slot: 'rhand',
                    name: this.$t('equipment.rightHand')
                },
                {
                    slot: 'garment',
                    name: this.$t('equipment.garment')
                },
                {
                    slot: 'acc1',
                    name: this.$t('equipment.accessory')
                }
            ],
            rightSlots: [
                {
                    slot: 'face',
                    name: this.$t('equipment.face')
                },
                {
                    slot: 'body',
                    name: this.$t('equipment.body')
                },
                {
                    slot: 'lhand',
                    name: this.$t('equipment.leftHand')
                },
                {
                    slot: 'footgear',
                    name: this.$t('equipment.footgear')
                },
                {
                    slot: 'acc2',
                    name: this.$t('equipment.accessory')
                }
            ]
        };
    },
    computed: {
        ...mapGetters([
            'characterHeadStyle',
            'characterHeadColor',
            'characterGender',
            'characterEquipment',
            'characterJob',
            'inventory',
            'serverUrl'
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
                        message: this.$t('character.errorRetrievingEqItems')
                    }
                ]);
            }
        });
    },
    beforeDestroy() {
        mo.socket.off('getEquipableItemsComplete');
    },
    methods: {
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId,
                equipmentId: item.id
            });
        },
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
                    return this.$t('attributes.patk');
                case 'matk':
                    return this.$t('attributes.matk');
                case 'pdef':
                    return this.$t('attributes.pdef');
                case 'mdef':
                    return this.$t('attributes.mdef');
                case 'maxHp':
                    return this.$t('attributes.mhp');
                case 'maxMp':
                    return this.$t('attributes.mmp');
                default:
                    return name.charAt(0).toUpperCase() + name.slice(1);
            }
        },
        itemClassNameCorrection(name, twoHanded = false) {
            if (name === 'sword' && twoHanded) {
                return this.$t('character.twoHandedSword');
            }

            return name.charAt(0).toUpperCase() + name.slice(1);
        },
        uneqipItem(slot) {
            // Triggering equip of an item on server
            mo.socket.emit('unequipItem', slot);

            this.showEquipmentModal = false;
        },
        equipItem(item) {
            // Triggering equip of an item on server
            mo.socket.emit('equipItem', {
                item,
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