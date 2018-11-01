<template>
    <section class="missions-page">
        <div class="heading">M</div>

        <div v-if="missionInitial === 1 && Object.keys(party).length">
            <p>Hey {{ party[0].name }}. Long time no see! Huh, where is your equipment? What happened? Wait. Tell me about it between the drinks, my superior is nearby, so can't chit-chat at the moment. We will provide you with essential stuff, consider it an investment into your party. Here's a 2 daggers, a sword and a bow and sets of armors, unfortunatelly few unlucky fellows won't be needing them anymore.</p>
            <button class="btn btn-success"
                @click="missionProgress(2)"
            >Continue</button>
        </div>
        <div v-else-if="missionInitial === 2">
            <p>Go on, put it on before we continue</p>
        </div>
    </section>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

const missionsPage = {
    data() {
        return {
            missionInitial: 0
        };
    },
    computed: {
        party() {
            return this.$store.getters.get('party') || [];
        }
    },
    created() {
        if (!functions.storage('get', 'missionInitial') || functions.storage('get', 'missionInitial') === 1) {
            // Update the state
            this.missionInitial = 1;
        } else if (functions.storage('get', 'missionInitial') <= 2) {
            this.missionInitial = functions.storage('get', 'missionInitial');
        }
    },
    methods: {
        missionProgress(progress) {
            if (progress === 2) {
                this.missionInitial = 2;

                // Adding 1st initial items
                const items = functions.storage('get', 'items') || [];

                // 2 Daggers
                items.push(1);
                items.push(1);

                // Sword
                items.push(100);

                // Bow
                items.push(300);

                // Light armor
                items.push(2000);
                items.push(2001);
                items.push(2002);
                items.push(2003);
                items.push(2004);

                // Heavy armor
                items.push(3000);
                items.push(3001);
                items.push(3002);
                items.push(3003);

                // Save items in storage
                functions.storage('set', 'items', items);

                // Updating state of initializations of missions
                functions.storage('set', 'missionInitial', 2);
            }

            return true;
        }
    }
};

// Routing
mo.routes.push({
    path: '/missions',
    component: missionsPage
});

export default missionsPage;
</script>