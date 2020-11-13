<template>
    <section class="players-shops">
        <div v-if="loading"
            class="players-shops__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="players-shops__wrapper"
        >
            <div class="players-shops__title">Open Shop</div>

            <div class="players-shops__shop">
                <p>What people see on the market list, make yourself presentable or show what are you selling. Equipment? Potions? Loot?</p>

                <div class="players-shops__form-element">
                    <div class="form-heading">Shop Name:</div>
                    <input v-model="shopName"
                        type="text"
                        placeholder="Shop Name"
                        maxlength="50"
                    >
                </div>

                <div class="players-shops__form-element">
                    <div class="form-heading">Shop Description: (can be empty)</div>
                    <input v-model="shopDescription"
                        type="text"
                        placeholder="Shop Description"
                        maxlength="150"
                    >
                </div>

                <div class="players-shops__form-element">
                    <div>
                        There is a flat price per day that you need to pay for the rent to {{ characterLocation }}. It gets deducted every day. If it reaches amount that you won't be able to afford to pay the rent, shop will be closed, remaining zeny will be lost and all remaining items will be sent to Kafra.<br>
                        Current price per day: <b>{{ currentPricePerDay }}Z</b>
                    </div>
                    <div class="form-heading">Initial amount in cashbox:</div>
                    <input v-model="cashboxAmount"
                        type="number"
                        :min="currentPricePerDay"
                        :max="maxCashboxAmount"
                        placeholder="Initial amount in cashbox"
                    >
                </div>

                <div class="players-shops__form-element">
                    <div>You can specify in what amount of days your shop should close. Leave it at <b>0</b> if it should be indefinite or until all items are sold.</div>
                    <div class="form-heading">In what amout of days shop will close:</div>
                    <input v-model="days"
                        type="number"
                        min="0"
                        :max="maxDays"
                        placeholder="In what amout of days shop will close"
                    >
                </div>

                <div v-if="errorMessage"
                    :class="{'players-shops__error--visible': errorMessage}"
                    class="players-shops__error"
                    v-html="errorMessage"
                />

                <button :disabled="!canOpenShop || buttonLoading"
                    class="btn btn-lg game-button players-shops__shop__open"
                    @click="openShop()"
                >Open own shop in city</button>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const openPlayersShopsPage = {
    components: {
        loading,
    },
    data() {
        return {
            loading: false,
            buttonLoading: false,
            shopName: '',
            shopDescription: '',
            cashboxAmount: 0,
            maxCashboxAmount: 20000000,
            days: '0',
            maxDays: 90,
            errorMessage: '',
            currentPricePerDay: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'characterLocation'
        ]),

        canOpenShop() {
            // Check if Vending skill level is higher or equals 1
            return this.characterSkills[26] >= 1;
        },
        formValidation() {
            return this.shopName && this.cashboxAmount >= this.currentPricePerDay && (this.days && this.days >= 0);
        }
    },
    watch: {
        cashboxAmount() {
            let amount = Number(this.cashboxAmount);

            if (amount < Number(this.currentPricePerDay)) {
                amount = Number(this.currentPricePerDay);
            } else if (amount > Number(this.maxCashboxAmount)) {
                amount = Number(this.maxCashboxAmount);
            }

            this.cashboxAmount = amount;
        },
        days() {
            let amount = Number(this.days);

            if (amount > this.maxDays) {
                amount = this.maxDays;
            }

            this.days = amount;
        }
    },
    mounted() {
        mo.socket.on('openShopComplete', (response) => {
            this.buttonLoading = false;

            if (response.status) {
                this.$router.push(`/players-shops/manage/${response.id}`);
                this.errorMessage = '';
            } else {
                this.errorMessage = response.message;
            }
        });

        mo.socket.on('getLocationVendingPriceComplete', (response) => {
            this.currentPricePerDay = response.pricePerDay;
            this.cashboxAmount = response;
        });

        mo.socket.emit('getLocationVendingPrice');
    },
    beforeDestroy() {
        mo.socket.off('openShopComplete');
        mo.socket.off('getLocationVendingPriceComplete');
    },
    methods: {
        openShop() {
            this.buttonLoading = true;

            mo.socket.emit('openShop', {
                name: this.shopName,
                description: this.shopDescription,
                amount: this.cashboxAmount,
                days: this.days
            });
        }
    }
};

// Routing
mo.routes.push({
    path: '/players-shops/open',
    component: openPlayersShopsPage
});

export default openPlayersShopsPage;
</script>