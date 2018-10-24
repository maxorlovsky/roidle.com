<template>
    <section class="party-page">
        <div class="heading">P</div>

        <router-link v-for="member of party"
            :key="member.id"
            :to="'/party/' + member.id"
            class="member-block"
        >
            <div class="avatar"></div>
            <div class="info">
                <div>{{ member.name }}</div>
                <div>L: {{ member.level }}</div>
            </div>
            <div v-if="messages[member.id]"
                class="important-info"
            >{{ messages[member.id] }}</div>
        </router-link>
    </section>
</template>

<script>
const partyPage = {
    data() {
        return {
            messages: []
        };
    },
    computed: {
        party() {
            const party = this.$store.getters.get('party') || [];

            if (party.length) {
                this.getImportantMessages(party);
            }

            return party;
        }
    },
    created() {
    },
    methods: {
        getImportantMessages(party) {
            for (const member of party) {
                if (member.statPoints) {
                    this.messages[member.id] = 'Stats are available';
                }
            }
        }
    }
};

// Routing
mo.routes.push({
    path: '/party',
    component: partyPage
});

export default partyPage;
</script>