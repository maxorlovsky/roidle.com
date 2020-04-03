<template>
    <div class="kafra-actions game__action">
        <div @click="showModal = true">
            <img src="/dist/assets/images/shopping.png">
            <span class="game__action__name">Shop Dealers</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">Shop Dealers</div>
            <div class="modal__content kafra-actions__buttons">
                <button class="btn btn-primary"
                    @click="$router.push('/shop?action=buy&type=equipment')"
                >Equipment Dealer - Buy</button>

                <button class="btn btn-primary"
                    @click="$router.push('/shop?action=sell&type=equipment')"
                >Equipment Dealer - Sell</button>

                <button class="btn btn-primary"
                    @click="$router.push('/shop?action=buy&type=tools')"
                >Tool Dealer - Buy</button>

                <button class="btn btn-primary"
                    @click="$router.push('/shop?action=sell&type=tools')"
                >Tool Dealer - Sell</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >Cancel</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'shop-actions',
    data() {
        return {
            showModal: false
        };
    },
    methods: {
        closeModal() {
            this.typeChosen = '';
            this.showModal = false;
        }
    }
};
</script>