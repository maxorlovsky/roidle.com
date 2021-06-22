<template>
    <div class="town-hall">
        <div class="town-hall__wrapper">
            {{ $t('townHall.title') }}
            Who is current mayor<br>
            When is the next election<br>
            Number of citizens<br>
            Number of houses + houses that are taken<br>
            Numbers of properties (unlimited) in use/rent<br>
            Upgrades available in the city, teleportation cirlces, craft, inn, etc<br>
            Taxes for citizens<br>
            Taxes for non-citizens<br>
            Message board from mayor<br>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

const townHallPage = {
    data() {
        return {
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'serverUrl'
        ])
    },
    methods: {
    },
};

// Routing
mo.routes.push({
    path: '/town-hall',
    component: townHallPage
});

export default townHallPage;
</script>