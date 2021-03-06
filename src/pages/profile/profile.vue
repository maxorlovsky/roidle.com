<template>
    <section class="profile">
        <template v-if="loading">
            <loading />
        </template>
        <template v-else>
            <div class="equipment">
                <div class="equipment__left">
                    <div v-for="eq in leftSlots"
                        :key="eq.slot"
                        :class="`equipment__slot equipment__${eq.slot}`"
                    >
                        <div v-if="equipment[eq.slot] && equipment[eq.slot].itemId"
                            class="equipment__item"
                            @click="getItemInfo(equipment[eq.slot])"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/items/${equipment[eq.slot].itemId}.gif`">
                            <span class="equipment__item__name">{{ equipment[eq.slot].name }}</span>
                        </div>
                        <span class="equipment__placeholder">{{ eq.name }}</span>
                    </div>
                </div>

                <div class="equipment__avatar">
                    <avatar v-if="equipment && headStyle"
                        :head-style="headStyle"
                        :head-color="headColor"
                        :dye-color="dyeColor"
                        :gender="gender"
                        :job="job"
                        :head-gears="[
                            equipment.head.itemId,
                            equipment.face.itemId,
                            equipment.mouth.itemId
                        ]"
                    />
                </div>

                <div class="equipment__left">
                    <div v-for="eq in rightSlots"
                        :key="eq.slot"
                        :class="`equipment__slot equipment__${eq.slot}`"
                    >
                        <div v-if="equipment[eq.slot] && equipment[eq.slot].itemId"
                            class="equipment__item"
                            @click="getItemInfo(equipment[eq.slot])"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/items/${equipment[eq.slot].itemId}.gif`">
                            <span class="equipment__item__name">{{ equipment[eq.slot].name }}</span>
                        </div>
                        <span class="equipment__placeholder">{{ eq.name }}</span>
                    </div>
                </div>
            </div>

            <attributes />
        </template>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';

// Components
import avatar from '@components/avatar/avatar.vue';
import attributes from '@components/attributes/attributes.vue';
import loading from '@components/loading/loading.vue';

const profilePage = {
    components: {
        avatar,
        attributes,
        loading
    },
    data() {
        return {
            loading: true,
            name: '',
            headStyle: 0,
            headColor: 0,
            dyeColor: 0,
            gender: '',
            job: '',
            partyName: '--',
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
            ],
            baseLevel: 0,
            jobLevel: 0
        };
    },
    computed: {
        ...mapGetters(['serverUrl'])
    },
    mounted() {
        mo.socket.on('getCharacterInfoComplete', (response) => {
            if (response) {
                this.name = response.name;
                this.partyName = response.partyName;
                this.headStyle = response.headStyle;
                this.headColor = response.headColor;
                this.dyeColor = response.dyeColor;
                this.gender = response.gender;
                this.job = response.job;
                this.equipment = response.equipment;
                this.baseLevel = response.baseLevel;
                this.jobLevel = response.jobLevel;

                this.setCharacterAttributes({
                    ...response.attributes,
                    publicProfile: true,
                    partyName: this.partyName,
                    name: this.name,
                    job: this.job,
                    baseLevel: this.baseLevel,
                    jobLevel: this.jobLevel
                });

                this.loading = false;
            } else {
                // In case user not found, we send player back to game page
                this.$router.push('/game');
            }
        });

        // In case Name param doesn't exist redirect to first page
        if (!this.$route.params.name) {
            this.$router.push('/game');
        }

        mo.socket.emit('getCharacterInfo', this.$route.params.name);
    },
    beforeDestroy() {
        mo.socket.off('getCharacterInfoComplete');
    },
    methods: {
        ...mapActions(['setCharacterAttributes']),

        getItemInfo(item) {
            if (item && item.itemId) {
                mo.socket.emit('getItemInfo', {
                    itemId: item.itemId,
                    equipmentId: item.id
                });
            }
        }
    }
};

// Routing
mo.routes.push({
    path: '/profile/:name',
    component: profilePage
});

export default profilePage;
</script>