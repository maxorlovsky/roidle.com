<template>
    <div class="kafra-actions game__action">
        <div @click="openModal()">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/shopping.png`"
            >
            <span class="game__action__name">{{ $t('shop.shopDealers') }}</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('shop.shopDealers') }}</div>
            <div class="modal__content kafra-actions__buttons">
                <button class="btn game-button"
                    @click="$router.push('/players-shops')"
                >{{ $t('shop.merchantsShops') }}</button>

                <button class="btn game-button"
                    @click="$router.push('/shop?action=buy&type=equipment')"
                >{{ $t('shop.equipmentDealer') }} - {{ $t('shop.buy') }}</button>

                <button class="btn game-button"
                    @click="$router.push('/shop?action=sell&type=equipment')"
                >{{ $t('shop.equipmentDealer') }} - {{ $t('shop.sell') }}</button>

                <button class="btn game-button"
                    @click="$router.push('/shop?action=buy&type=tools')"
                >{{ $t('shop.toolDealer') }} - {{ $t('shop.buy') }}</button>

                <button class="btn game-button"
                    @click="$router.push('/shop?action=sell&type=tools')"
                >{{ $t('shop.toolDealer') }} - {{ $t('shop.sell') }}</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'shop-actions',
    data() {
        return {
            showModal: false
        };
    },
    computed: {
        ...mapGetters([
            'characterCrafting',
            'serverUrl',
            'gameModal'
        ])
    },
    watch: {
        gameModal() {
            if (this.gameModal === 'shop') {
                return false;
            }

            this.closeModal();
        }
    },
    methods: {
        openModal() {
            if (this.characterCrafting) {
                return false;
            }

            this.showModal = true;

            this.$store.commit('gameModal', 'shop');
        },
        closeModal() {
            this.typeChosen = '';
            this.showModal = false;
        }
    }
};
</script>