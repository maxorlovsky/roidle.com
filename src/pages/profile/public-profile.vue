<template>
    <section class="profile">
        <template v-if="loading">
            <loading />
        </template>
        <template v-else-if="characterNotFound">
            <div class="profile__error">Character not found</div>
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

        <div class="profile__public-button">
            <a class="btn game-button"
                href="/"
            >Back to game</a>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';
import axios from 'axios';

// Components
import avatar from '@components/avatar/avatar.vue';
import attributes from '@components/attributes/attributes.vue';
import loading from '@components/loading/loading.vue';

const profilePublicPage = {
    components: {
        avatar,
        attributes,
        loading
    },
    data() {
        return {
            loading: true,
            characterNotFound: false,
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
    computed: {
        ...mapGetters(['serverUrl'])
    },
    async mounted() {
        // We ping the server, to know that it's alive, in case it isn't we're redirecting user to server-down page
        try {
            const response = await axios.get(`${mo.serverUrl}/api/character/${this.$route.params.name}`);

            this.name = response.data.name;
            this.partyName = response.data.partyName;
            this.headStyle = response.data.headStyle;
            this.headColor = response.data.headColor;
            this.gender = response.data.gender;
            this.job = response.data.job;
            this.equipment = response.data.equipment;
            this.attributes = response.data.attributes;
            this.baseLevel = response.data.baseLevel;
            this.jobLevel = response.data.jobLevel;
        } catch (error) {
            this.characterNotFound = true;

            return false;
        } finally {
            this.loading = false;
        }
    },
    methods: {
        async getItemInfo(item) {
            if (item && item.itemId) {
                try {
                    const response = await axios.get(`${mo.serverUrl}/api/item?itemId=${item.itemId}&id=${item.id}`);

                    this.$store.commit('publicItemInfo', response.data);
                } catch (error) {
                    console.error('ERROR');
                    console.error(error);
                }
            }
        }
    }
};

// Routing
mo.routes.push({
    path: '/public/character/:name',
    component: profilePublicPage
});

export default profilePublicPage;
</script>