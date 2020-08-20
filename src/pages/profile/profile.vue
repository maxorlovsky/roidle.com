<template>
    <section class="character">
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
                            @click="getItemInfo(equipment[eq.slot].itemId)"
                        >
                            <img :src="`/dist/assets/images/items/${equipment[eq.slot].itemId}.gif`">
                            <span class="equipment__item__name">{{ equipment[eq.slot].name }}</span>
                        </div>
                        <span class="equipment__placeholder">{{ eq.name }}</span>
                    </div>
                </div>

                <div class="equipment__avatar">
                    <avatar v-if="equipment && headStyle"
                        :head-style="headStyle"
                        :head-color="headColor"
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
                            @click="getItemInfo(equipment[eq.slot].itemId)"
                        >
                            <img :src="`/dist/assets/images/items/${equipment[eq.slot].itemId}.gif`">
                            <span class="equipment__item__name">{{ equipment[eq.slot].name }}</span>
                        </div>
                        <span class="equipment__placeholder">{{ eq.name }}</span>
                    </div>
                </div>
            </div>

            <attributes :public-profile="true"
                :name="name"
                :patk="attributes.patk"
                :matk="attributes.matk"
                :pdef="attributes.pdef"
                :mdef="attributes.mdef"
                :hit="attributes.hit"
                :eva="attributes.eva"
                :speed="attributes.speed"
                :crit="attributes.crit"
                :crit-def="attributes.critDef"
                :max-hp="attributes.maxHp"
                :max-mp="attributes.maxMp"
                :party-name="partyName"
                :job="job"
                :base-level="baseLevel"
                :job-level="jobLevel"
            />
        </template>
    </section>
</template>

<script>
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
            ],
            attributes: {
                patk: 0,
                matk: 0,
                pdef: 0,
                mdef: 0,
                hit: 0,
                eva: 0,
                speed: 0,
                crit: 0,
                critDef: 0,
                maxHp: 0,
                maxMp: 0
            },
            baseLevel: 0,
            jobLevel: 0
        };
    },
    mounted() {
        mo.socket.on('getCharacterInfoComplete', (response) => {
            if (response) {
                this.name = response.name;
                this.partyName = response.partyName;
                this.headStyle = response.headStyle;
                this.headColor = response.headColor;
                this.gender = response.gender;
                this.job = response.job;
                this.equipment = response.equipment;
                this.attributes = response.attributes;
                this.baseLevel = response.baseLevel;
                this.jobLevel = response.jobLevel;

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

        // Hiding chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('getCharacterInfoComplete');

        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        getItemInfo(itemId) {
            if (itemId) {
                mo.socket.emit('getItemsInfo', [itemId]);
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