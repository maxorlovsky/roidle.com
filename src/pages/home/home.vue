<template>
    <section class="home-page">
        <generate-party v-if="initialWindow" />

        <div v-else>
            <p>Hello: {{ party[0].name }}</p>

            <p>{{ party }}</p>
        </div>
    </section>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

// Components
import generateParty from '../../components/generate-party/generate-party.vue';

const homePage = {
    components: {
        generateParty
    },
    data() {
        return {
            initialWindow: true,
            party: []
        };
    },
    created() {
        if (functions.storage('get', 'party')) {
            this.initialWindow = false;
            this.party = functions.storage('get', 'party');
        }
    }
};

// Routing
mo.routes.push({
    path: '/',
    component: homePage
});

export default homePage;
</script>