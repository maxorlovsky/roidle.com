<template>
    <section class="refinement">
        <div class="refinement__wrapper">
            <div class="refinement__title">{{ $t('refine.title') }}</div>
            <div class="refinement__explanation"
                v-html="$t('refine.explanation')"
            />

            <div v-if="!characterRefining"
                class="refinement__inventory-wrapper"
            >
                <div class="refinement__title">{{ $t('shop.inventory') }}</div>

                <div class="search-input">
                    <input v-model="search"
                        :placeholder="$t('global.search')"
                        maxlength="50"
                        type="text"
                    >
                    <div v-show="search"
                        class="search-input__close"
                        @click="search = ''"
                    >X</div>
                </div>

                <template v-if="inventory.length">
                    <div v-for="(item, index) in filteredInventory"
                        :key="index"
                        @click="selectItemToRefine(item)"
                    >
                        <item-block :item="item"
                            :show-item-info="false"
                            :disabled="buttonLoading"
                        />
                    </div>
                </template>
                <template v-else>
                    <div class="refinement__inventory-wrapper__empty">{{ $t('global.empty') }}</div>
                </template>
            </div>

            <div v-if="oldItem && newItem"
                class="refinement__item-progress"
            >
                <div v-if="characterRefining && refineData"
                    class="refinement__item-progress__text"
                >
                    {{ $t('refine.youAreRefining') }} {{ refineData.successChance }}%.<br>
                </div>

                <div class="refinement__item-progress__item">
                    <item-block :item="oldItem" />

                    <div class="refinement__item-progress__item-text">
                        {{ oldItem.name }} +{{ oldRefinement }}<br>
                        {{ oldItem.paramsString }}
                    </div>
                </div>

                <div v-if="newRefinement <= 10"
                    class="refinement__item-progress__arrow"
                >
                    <i class="icon icon-arrow-forward" />
                </div>

                <div v-if="newRefinement <= 10"
                    class="refinement__item-progress__item"
                >
                    <item-block :item="newItem" />

                    <div class="refinement__item-progress__item-text">
                        {{ newItem.name }} +{{ newRefinement }}<br>
                        {{ newItem.paramsString }}
                    </div>
                </div>

                <div v-if="characterRefining"
                    class="refinement__item-progress__button"
                >
                    <button class="btn btn-danger"
                        @click="cancelRefinement()"
                    >{{ $t('refine.abandonRefinement') }}</button>
                    <br>
                    {{ $t('refine.abandonRefinementExplanation') }}
                </div>
            </div>
            <div v-else
                class="refinement__item-progress"
            >
                <div class="refinement__inventory-wrapper__empty">{{ $t('refine.selectItem') }}</div>
            </div>

            <div v-if="!characterRefining && newRefinement <= 10"
                class="refinement__cost"
            >
                <div class="refinement__cost__title">{{ $t('refine.cost') }}</div>
                <template v-if="cost.price">
                    <div class="refinement__cost__item">
                        <div class="refinement__cost__item__title">{{ $t('craft.priceForToolPerMinute', {
                            tool: $t('refine.title')
                        }) }}</div>
                        <div class="refinement__cost__item__value">{{ cost.price }} Z</div>
                    </div>
                    <div class="refinement__cost__item">
                        <div class="refinement__cost__item__title">{{ $t('craft.timeRequired') }}</div>
                        <div class="refinement__cost__item__value">{{ cost.timeRequired }}m</div>
                    </div>
                    <div class="refinement__cost__item">
                        <div class="refinement__cost__item__title">{{ $t('global.mpCost') }}</div>
                        <div :class="{'refinement__cost__item__value--not-available': characterMp < cost.mpCost }"
                            class="refinement__cost__item__value"
                        >
                            {{ cost.mpCost }} MP
                        </div>
                    </div>
                    <div class="refinement__cost__item">
                        <div class="refinement__cost__item__title">{{ $t('craft.priceForTool', {
                            tool: $t('refine.title')
                        }) }}</div>
                        <div class="refinement__cost__item__value">{{ cost.priceWithoutTax }} Z</div>
                    </div>
                    <div class="refinement__cost__item">
                        <div class="refinement__cost__item__title">{{ $t('craft.locationTax', {
                            location: characterLocation
                        }) }} ({{ cost.tax }}%)</div>
                        <div class="refinement__cost__item__value">+{{ cost.taxPrice }} Z</div>
                    </div>
                    <div v-if="cost.discount !== 0"
                        class="refinement__cost__item"
                    >
                        <div class="refinement__cost__item__title">{{ $t('craft.discount') }}</div>
                        <div class="refinement__cost__item__value">-{{ cost.discount }} Z</div>
                    </div>
                    <div class="refinement__cost__item">
                        <div class="refinement__cost__item__title">{{ $t('refine.chance') }}</div>
                        <div :class="{'refinement__cost__item__value--not-available': cost.chance === 0}"
                            class="refinement__cost__item__value"
                        >{{ refinementChance }}%</div>
                    </div>
                    <div class="refinement__cost__item refinement__cost__item--materials">
                        <div class="refinement__cost__item__title">{{ $t('refine.materials') }}</div>
                        <div class="refinement__cost__item__value">
                            <div v-for="material in cost.materials"
                                :key="material.itemId"
                                class="refinement__cost__item__materials"
                            >
                                <item-block :item="material"
                                    :display-item-amount="material.amount"
                                />
                            </div>
                        </div>
                    </div>
                    <div v-if="cost.chance !== 0 && cost.chance !== 100"
                        class="refinement__cost__item refinement__cost__item--materials"
                    >
                        <div class="refinement__cost__item__title">{{ $t('refine.buffItem') }}</div>
                        <div class="refinement__cost__item__value">
                            <div class="refinement__cost__item__materials">
                                <VueToggles :value="includeHammer"
                                    :checked-text="$t('refine.include')"
                                    :unchecked-text="$t('refine.exclude')"
                                    width="110"
                                    checked-bg="#16b3fc"
                                    @click="includeHammer = !includeHammer"
                                />
                            </div>

                            <div class="refinement__cost__item__materials">
                                <item-block :item="buffItem"
                                    :display-item-amount="1"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="refinement__cost__item refinement__cost__item--total">
                        <div class="refinement__cost__item__title">{{ $t('craft.total') }}</div>
                        <div class="refinement__cost__item__value">{{ cost.total }} Z</div>
                    </div>

                    <div v-if="!canRefine"
                        class="refinement__can-not-refine"
                    >{{ $t('refine.refinementRequirementsNotMet') }}</div>

                    <button :disabled="!canRefine || buttonLoading"
                        class="btn btn-lg game-button refinement__button"
                        @click="refineItem()"
                    >{{ $t('craft.start') }}</button>
                </template>
                <div v-else
                    class="refinement__inventory-wrapper__empty"
                >{{ $t('refine.selectItem') }}</div>
            </div>
        </div>

        <div v-if="showCancelModal"
            class="refinement__cancel"
        >
            <div class="refinement__cancel__caution-text">{{ $t('refine.confirmationToCancel') }}</div>
            <button class="btn btn-secondary"
                @click="showCancelModal = false"
            >{{ $t('global.no') }}</button>
            <button class="btn btn-danger"
                @click="confirmCancelRefinement()"
            >{{ $t('global.yes') }}</button>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';
import VueToggles from 'vue-toggles';

// Components
import itemBlock from '@components/item-block/item-block.vue';

// Utils
import { humanReadableParams } from '@utils/inventory.js';

// Mixins
import timerMixin from '@mixins/timers.js';
import chatMixin from '@mixins/chat.js';

let refiningItemId = 0;

const refinementPage = {
    components: {
        VueToggles,
        itemBlock
    },
    mixins: [chatMixin, timerMixin],
    data() {
        return {
            buttonLoading: false,
            search: '',
            oldItem: null,
            newItem: null,
            oldRefinement: 0,
            newRefinement: 0,
            cost: {
                price: 0,
                timeRequired: 0,
                mpCost: 0,
                priceWithoutTax: 0,
                tax: 0,
                taxPrice: 0,
                discount: 0,
                chance: 0,
                materials: [],
                total: 0,
            },
            buffItem: {
                itemId: 1005,
                name: 'Hammer of Blacksmith',
                type: 'loot'
            },
            showCancelModal: false,
            includeHammer: false
        };
    },
    computed: {
        ...mapGetters([
            'characterLocation',
            'inventory',
            'characterSkills',
            'characterMp',
            'characterRefining',
            'characterZeny',
            'refineData'
        ]),

        refinementChance() {
            let chance = 0;

            if (this.cost.chance) {
                chance += this.cost.chance;
            }

            if (this.includeHammer) {
                chance += 5;
            }

            return chance;
        },
        filteredInventory() {
            // Filter by type, we're only interested in equipment
            let inv = this.inventory.filter((item) => item.type === 'weapon' || item.type === 'armor');

            if (this.search) {
                inv = inv.filter((item) => item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
            }

            return inv || [];
        },
        canRefine() {
            let haveItems = true;

            // Check if user have enough materials to craft
            for (const material of this.cost.materials) {
                const find = this.inventory.find((item) => item.itemId === material.itemId && item.amount >= material.amount);

                if (!find) {
                    haveItems = false;
                }
            }

            // In case user want to include hammer, we check if hammer exist
            if (this.includeHammer) {
                const findHammer = this.inventory.find((item) => item.itemId === 1005);

                if (!findHammer) {
                    haveItems = false;
                }
            }

            // Check if user have enough MP to craft
            if (this.characterMp < this.cost.mpCost) {
                haveItems = false;
            }

            // Check if user have needed skill to do the refinement
            if (this.newRefinement > this.characterSkills[68]) {
                haveItems = false;
            }

            // Check if user have enough zeny
            if (this.characterZeny < this.cost.total) {
                haveItems = false;
            }

            if (this.newRefinement > 10) {
                haveItems = false;
            }

            return haveItems;
        }
    },
    watch: {
        characterRefining() {
            // Do reset in case refinement finished on the same page
            if (!this.characterRefining) {
                this.buttonLoading = false;
                this.cost.price = 0;
                this.oldItem = null;
                this.newItem = null;
                refiningItemId = 0;
            }
        },
        refineData: {
            immediate: true,
            handler() {
                if (this.refineData) {
                    this.cleanItems(this.refineData.originalItem, this.refineData.itemOutput);
                }
            }
        },
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[26] >= 10) {
                    this.canUploadImage = true;
                } else {
                    this.canUploadImage = false;
                }
            }
        }
    },
    mounted() {
        mo.socket.on('refineItemCheckComplete', (response) => {
            if (response.status) {
                this.cleanItems(response.item, response.newItem);

                this.cost.price = response.prices.priceForRefinementPerMinute;
                this.cost.timeRequired = response.time;
                this.cost.mpCost = response.prices.mpCost;
                this.cost.priceWithoutTax = response.prices.priceWithoutTax;
                this.cost.tax = response.prices.tax;
                this.cost.taxPrice = response.prices.taxPrice;
                this.cost.discount = response.prices.discount;
                this.cost.total = response.prices.fullPrice;
                this.cost.chance = response.refineChance;
                this.cost.materials = response.prices.materials;
            }

            this.buttonLoading = false;
        });

        mo.socket.on('refineItemComplete', (response) => {
            // In case craft is successfully started, we trigger the fetch of the craft to show it in UI and redirect user to game window
            if (response) {
                this.$store.commit('refinementStart');
            } else {
                this.buttonLoading = false;
            }
        });
    },
    beforeDestroy() {
        mo.socket.off('refineItemCheckComplete');
        mo.socket.off('refineItemComplete');
    },
    methods: {
        confirmCancelRefinement() {
            mo.socket.emit('cancelRefinement');
            this.showCancelModal = false;
        },
        cancelRefinement() {
            this.showCancelModal = true;
        },
        cleanItems(originalItem, outputItem) {
            this.oldItem = originalItem;
            this.newItem = outputItem;

            const oldItemParams = humanReadableParams(this.oldItem.params);
            const newItemParams = humanReadableParams(this.newItem.params);

            // Item ID for item is set as normal ID, so need to be updated
            this.oldItem.itemId = this.oldItem.id;
            this.oldItem.paramsString = oldItemParams.paramsString;

            // Do same for new item
            this.newItem.itemId = this.newItem.id;
            this.newItem.paramsString = newItemParams.paramsString;

            this.oldRefinement = this.oldItem.refined;
            this.newRefinement = this.newItem.refined;
        },
        selectItemToRefine(item) {
            if (this.buttonLoading) {
                return false;
            }

            this.buttonLoading = true;

            refiningItemId = item.id;

            mo.socket.emit('refineItemCheck', item.id);
        },
        refineItem() {
            this.buttonLoading = true;

            mo.socket.emit('refineItem', refiningItemId, this.includeHammer);
        }
    }
};

// Routing
mo.routes.push({
    path: '/refinement',
    component: refinementPage
});

export default refinementPage;
</script>