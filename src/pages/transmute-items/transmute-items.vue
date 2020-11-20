<template>
    <section class="transmute-items">
        <div v-if="loading"
            class="transmute-items__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="transmute-items__wrapper"
        >
            <div class="transmute-items__list">
                <div class="transmute-items__title">Item Transmutation</div>

                <p>Item transmutation is a skill that allow intelectual Alchemists, Wizards and Sages to transmute items of one kind to be converted into another. By decomposing it into protons and atoms and reconstructing it in the end. World is still opening new formulas, but general formulas to create the most required materials are well known and practised by a lot of Merchants and Mages.</p>

                <p>Below are the formulas that are available to you.</p>

                <div v-for="(item, index) in transmutableItems"
                    :key="index"
                    class="transmute-items__item"
                >
                    <div class="transmute-items__item__image-amount"
                        @click="showItemInfo(item)"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.id}.gif`">
                        <span>{{ item.amount }}</span>
                    </div>
                    <div class="transmute-items__item__name-price">
                        <div class="transmute-items__item__name-price__name">{{ item.itemName }}</div>
                    </div>
                    <router-link :to="`/transmute-items/${item.id}`"
                        class="transmute-items__item__move"
                    >
                        &gt;
                    </router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const transmuteItemsPage = {
    components: {
        loading
    },
    data() {
        return {
            loading: true,
            transmutableItems: [],
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'serverUrl'
        ])
    },
    mounted() {
        // In case user don't have skill to transmute items we kick him back to previous page
        if (this.characterSkills[28] < 1) {
            this.$router.go(-1);
        }

        mo.socket.on('getTransmuteListComplete', (response) => {
            this.transmutableItems = response;

            this.loading = false;
        });

        mo.socket.emit('getTransmuteList');
    },
    beforeDestroy() {
        mo.socket.off('getTransmuteListComplete');
    },
    methods: {
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.id
            });
        }
    }
};

// Routing
mo.routes.push({
    path: '/transmute-items',
    component: transmuteItemsPage
});

export default transmuteItemsPage;
</script>