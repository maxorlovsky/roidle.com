<template>
    <section class="missions-page">
        <div class="heading">M</div>

        <div v-if="missionState === 1 && Object.keys(party).length">
            <p>Hey {{ party[0].name }}. Long time no see, where did you lost your weapons? No worries, we will provide you with essential stuff. Here's a 2 daggers, a sword and a bow</p>
        </div>
    </section>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

const missionsPage = {
    data() {
        return {
            missionsState: 0
        };
    },
    computed: {
        party() {
            return this.$store.getters.get('party') || [];
        }
    },
    created() {
        if (!functions.storage('get', 'missions')) {
            // Adding 1st initial items
            const items = functions.storage('get', 'missions') || [];

            // Daggers
            items.push(1);
            items.push(1);

            // Sword
            items.push(2);

            // Bow
            items.push(3);
            console.log(items);
            this.missionState = 1;
        }
    },
    methods: {
        
    }
};

// Routing
mo.routes.push({
    path: '/missions',
    component: missionsPage
});

export default missionsPage;
</script>