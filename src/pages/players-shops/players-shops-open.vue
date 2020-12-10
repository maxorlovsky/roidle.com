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
            <div class="players-shops__title">{{ $t('shop.openShop') }}</div>

            <div class="players-shops__shop">
                <p>{{ $t('shop.openShopPresentYourself') }}</p>

                <div class="players-shops__form-element">
                    <div class="form-heading">{{ $t('shop.shopName') }}:</div>
                    <input v-model="shopName"
                        :placeholder="$t('shop.shopName')"
                        type="text"
                        maxlength="50"
                    >
                </div>

                <div class="players-shops__form-element">
                    <div class="form-heading">{{ $t('shop.shopDescription') }}</div>
                    <input v-model="shopDescription"
                        :placeholder="$t('shop.shopDescriptionPlaceholder')"
                        type="text"
                        maxlength="150"
                    >
                </div>

                <div class="players-shops__form-element">
                    <div>
                        {{ $t('shop.rentExplanation', {
                            location: characterLocation
                        }) }}<br>
                        {{ $t('shop.rentPricePerDay') }}: <b>{{ currentPricePerDay }}Z</b>
                    </div>
                    <div class="form-heading">{{ $t('shop.initialMoneyInCashbox') }}:</div>
                    <input v-model="cashboxAmount"
                        :placeholder="$t('shop.initialMoneyInCashbox')"
                        type="number"
                        :min="currentPricePerDay"
                        :max="maxCashboxAmount"
                    >
                </div>

                <div class="players-shops__form-element">
                    <div>{{ $t('shop.shopClosureDaysExplanation') }}</div>
                    <div class="form-heading">{{ $t('shop.inWhatDayShopClose') }}:</div>
                    <input v-model="days"
                        :placeholder="$t('shop.inWhatDaysShopClose')"
                        type="number"
                        min="0"
                        :max="maxDays"
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
                >{{ $t('shop.openOwnShop') }}</button>
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