<template>
    <section class="monsters-lore">
        <div class="monsters-lore-wrapper">
            <search-autocomplete :button-loading="buttonLoading"
                :suggestions="suggestions"
                @loading="searchLoading"
                @search="searchProcess"
            />

            <loading v-if="loading" />

            <div v-if="showMonster"
                class="monsters-lore__monster"
            >
                <div v-if="monsterData"
                    class="monsters-lore__monster__wrapper"
                >
                    <div class="monsters-lore__monster__image">
                        <img :src="`${serverUrl}/dist/assets/images/mobs/${monsterData.id}.gif`">
                    </div>

                    <div class="attributes monsters-lore__attributes">
                        <div class="attributes__params attributes__params--half">
                            <span class="attributes__params__label">{{ $t('global.element') }}</span>
                            <span :class="['attributes__params__value', `attributes__params__value--${monsterData.element}`, 'capitalize']">{{ monsterData.element }}</span>
                        </div>
                        <div class="attributes__params attributes__params--half">
                            <span class="attributes__params__label">{{ $t('monstersLore.level') }}</span>
                            <span class="attributes__params__value">{{ monsterData.level }}</span>
                        </div>
                        <div class="attributes__params attributes__params--half">
                            <span class="attributes__params__label">{{ $t('global.bexp') }}</span>
                            <span class="attributes__params__value">{{ monsterData.exp }}</span>
                        </div>
                        <div class="attributes__params attributes__params--half">
                            <span class="attributes__params__label">{{ $t('global.jexp') }}</span>
                            <span class="attributes__params__value">{{ monsterData.jexp }}</span>
                        </div>
                    </div>

                    <div class="attributes monsters-lore__attributes">
                        <div class="attributes__params">
                            <span class="attributes__params__label">STR</span>
                            <span class="attributes__params__value">{{ monsterData.stats.str }}</span>
                        </div>
                        <div class="attributes__params">
                            <span class="attributes__params__label">DEX</span>
                            <span class="attributes__params__value">{{ monsterData.stats.dex }}</span>
                        </div>
                        <div class="attributes__params">
                            <span class="attributes__params__label">INT</span>
                            <span class="attributes__params__value">{{ monsterData.stats.int }}</span>
                        </div>
                        <div class="attributes__params">
                            <span class="attributes__params__label">VIT</span>
                            <span class="attributes__params__value">{{ monsterData.stats.vit }}</span>
                        </div>
                        <div class="attributes__params">
                            <span class="attributes__params__label">WIS</span>
                            <span class="attributes__params__value">{{ monsterData.stats.wis }}</span>
                        </div>
                        <div class="attributes__params">
                            <span class="attributes__params__label">LUK</span>
                            <span class="attributes__params__value">{{ monsterData.stats.luk }}</span>
                        </div>
                    </div>

                    <attributes class="monsters-lore__stats-attributes" />

                    <div class="monsters-lore__items">
                        <div v-for="(item, index) in monsterData.drops"
                            :key="index"
                            class="monsters-lore__item"
                            @click.exact="showItemInfo(item.itemId)"
                            @click.ctrl="parseItemToChat(item.itemName)"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                            <span class="monsters-lore__item__drop-chance">{{ item.dropChance.toFixed(2) / 100 }}%</span>
                        </div>
                    </div>
                </div>
                <div v-else
                    class="monsters-lore__monster__empty"
                >{{ $t('monstersLore.monsterNotFound') }}</div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';

// Components
import attributes from '@components/attributes/attributes.vue';
import loading from '@components/loading/loading.vue';
import searchAutocomplete from '@components/search-autocomplete/search-autocomplete.vue';

// Mixins
import chatMixin from '@mixins/chat.js';

const monstersLorePage = {
    components: {
        attributes,
        loading,
        searchAutocomplete
    },
    mixins: [chatMixin],
    data() {
        return {
            loading: false,
            buttonLoading: false,
            monsterData: null,
            showMonster: false,
            suggestions: [],
            items: []
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'partyAvailableSkillsIds',
            'serverUrl'
        ])
    },
    mounted() {
        if (!this.characterSkills[53] && !this.partyAvailableSkillsIds[53]) {
            this.$router.go(-1);

            return;
        }

        mo.socket.on('getMonsterNamesComplete', (response) => {
            this.suggestions = response;
        });

        mo.socket.on('getEncyclopediaMonsterComplete', (response) => {
            this.showMonster = true;
            this.monsterData = response;
            this.setCharacterAttributes({
                ...this.monsterData.attributes,
                name: this.monsterData.name,
                monster: true
            });
            this.buttonLoading = false;
            this.loading = false;
        });

        mo.socket.emit('getMonsterNames');
    },
    beforeDestroy() {
        mo.socket.off('getMonsterNamesComplete');
        mo.socket.off('getEncyclopediaMonsterComplete');
    },
    methods: {
        ...mapActions(['setCharacterAttributes']),

        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        searchLoading(loading) {
            if (loading) {
                this.buttonLoading = true;
            } else {
                this.buttonLoading = false;
            }
        },
        searchProcess(search) {
            mo.socket.emit('getEncyclopediaMonster', search);
        }
    }
};

// Routing
mo.routes.push({
    path: '/monsters-lore',
    component: monstersLorePage
});

export default monstersLorePage;
</script>