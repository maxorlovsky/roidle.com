<template>
    <form class="home-page"
        @submit.prevent="saveNames()"
    >
        <p>You've been travelling the continent of "Agnolia" with group of 4 friends, including yourself. Before we get into the story, let's get their names.</p>
        <div v-for="member of party"
            :key="member.id"
            class="member-block"
        >
            <div>
                <span v-if="member.id === 0"
                    class="member-text"
                >You</span>
                <span v-else
                    class="member-text"
                >Member {{ member.id }}</span>
                <input v-model="member.name"
                    type="text"
                    class="names"
                >
                <button @click.prevent="randomizeName(member.id)">rand</button>
            </div>
            <div>
                <select v-model="member.class">
                    <option v-for="job of classes"
                        :key="job.id"
                        :value="job.id"
                    >{{ job.name }}</option>
                </select>
                {{ classes[member.class - 1].info }}
            </div>
        </div>

        <button >Proceed</button>
    </form>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

// Configs
import classes from '../../../config/classes.json';
import names from '../../../config/names.json';

// Mixins
import classMixin from '../../mixins/class-mixin.js';

const homePage = {
    mixins: [classMixin],
    data() {
        return {
            party: [
                {
                    id: 0,
                    name: 'You',
                    class: 1
                },
                {
                    id: 1,
                    name: 'Biggs',
                    class: 1
                },
                {
                    id: 2,
                    name: 'Wedge',
                    class: 1
                },
                {
                    id: 3,
                    name: 'Jessie',
                    class: 1
                }
            ],
            classes: classes
        };
    },
    methods: {
        randomizeName(memberId) {
            const index = this.party.findIndex((member) => member.id === memberId);
            const randomInt = Math.floor(Math.random() * Math.floor(names.length));

            this.party[index].name = names[randomInt];
        },
        saveNames() {
            if (!this.checkNames()) {
                console.log('error');
                return false;
            }

            this.storeParty();

            this.initialWindow = false;
        },
        storeParty() {
            // Fill in missing data
            for (const member of this.party) {
                member.level = 1;
                member.statPoints = 7;
                member.exp = 0;
                member.stats = {
                    pow: 1,
                    wis: 1,
                    hea: 1
                };

                // Adding params depending on class
                member.params = this.getClassParams(member.class, member.stats);

                // Adding hp
                member.hp = member.params.health;

                // Adding equipment slots
                member.eq = {
                    head: 0,
                    body: 0,
                    rhand: 0,
                    lhand: 0,
                    pants: 0,
                    boots: 0,
                    racc: 0,
                    lacc: 0
                };
            }

            // Saving token in localStorage after how many days it should expire
            // 604800000 = 7 * 90 days
            functions.storage('set', 'party', this.party, 604800000 * 90);

            this.$store.commit('saveParty', this.party);
            this.$store.commit('displayDockedMenu', true);

            this.$router.replace('/game');
        },
        checkNames() {
            let num = 1;

            for (const member of this.party) {
                if (!member.name) {
                    console.log(`member of party nr. ${num} name missing`);
                    return false;
                }

                const reg = /\w+/g;
                if (!reg.test(member.name)) {
                    console.log(`member of party nr. ${num} name is incorrect`);
                    return false;
                }

                num++;
            }

            return true;
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