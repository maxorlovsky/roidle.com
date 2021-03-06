<template>
    <section class="profile profile--public">
        <template v-if="loading">
            <loading />
        </template>
        <template v-else-if="characterNotFound">
            <div class="profile__error">
                <div class="profile__error__wrapper">{{ $t('character.characterNotFound') }}</div>
            </div>
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

        <div class="profile__public-button">
            <a class="btn game-button"
                href="/"
            >{{ $t('character.backToGame') }}</a>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';
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
    async mounted() {
        // We ping the server, to know that it's alive, in case it isn't we're redirecting user to server-down page
        try {
            const response = await axios.get(`${mo.serverUrl}/api/character/${this.$route.params.name}`);

            this.name = response.data.name;
            this.partyName = response.data.partyName;
            this.headStyle = response.data.headStyle;
            this.headColor = response.data.headColor;
            this.dyeColor = response.data.dyeColor;
            this.gender = response.data.gender;
            this.job = response.data.job;
            this.equipment = response.data.equipment;
            this.baseLevel = response.data.baseLevel;
            this.jobLevel = response.data.jobLevel;

            this.setCharacterAttributes({
                ...response.data.attributes,
                publicProfile: true,
                partyName: this.partyName,
                name: this.name,
                job: this.job,
                baseLevel: this.baseLevel,
                jobLevel: this.jobLevel
            });
        } catch (error) {
            this.characterNotFound = true;

            return false;
        } finally {
            this.loading = false;
        }
    },
    methods: {
        ...mapActions(['setCharacterAttributes']),

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