<template>
    <section class="home-page">
        <form v-if="initialWindow"
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
                    />
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

        <div v-else>
            <p>Hello: {{ party[0].name }}</p>

            <p>{{ party }}</p>
        </div>
    </section>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

const homePage = {
    data() {
        return {
            initialWindow: true,
            party: [
                {
                    id: 0,
                    name: '',
                    class: 1,
                    level: 1,
                    exp: 0,
                    stats: {}
                },
                {
                    id: 1,
                    name: 'Biggs',
                    class: 2,
                    level: 1,
                    exp: 0,
                    stats: {}
                },
                {
                    id: 2,
                    name: 'Wedge',
                    class: 3,
                    level: 1,
                    exp: 0,
                    stats: {}
                },
                {
                    id: 3,
                    name: 'Jessie',
                    class: 4,
                    level: 1,
                    exp: 0,
                    stats: {}
                }
            ],
            classes: [
                {
                    id: 1,
                    name: 'Fighter',
                    info: 'Really straight-forwards class who like like to rush into melee fight and protect his allies. Fight with 1h-sword + shield, 2h-sword or spear/halberd',
                    stats: {
                        energy: 2,
                        health: 2,
                        str: 2,
                        wis: 1
                    },
                    modifiers: {
                        health: 10
                    }
                },
                {
                    id: 2,
                    name: 'Thief',
                    info: 'Nimble fighter with high accuracy, speed and crits. Use daggers, bows, or crossbows',
                    stats: {
                        energy: 3,
                        health: 2,
                        str: 1,
                        wis: 1
                    },
                    modifiers: {
                        health: 8
                    }
                },
                {
                    id: 3,
                    name: 'Mage',
                    info: 'Magician practitioner who learn ways of elemental magic, use staff, wands+shield',
                    stats: {
                        energy: 3,
                        health: 1,
                        str: 1,
                        wis: 2
                    },
                    modifiers: {
                        health: 5
                    }
                },
                {
                    id: 4,
                    name: 'Cleric',
                    info: 'Healer for your party who specializes in both magical and medical healing. Use blunt weapon + shield, staff, wands+shield, crossbow',
                    stats: {
                        energy: 1,
                        health: 2,
                        str: 1,
                        wis: 3
                    },
                    modifiers: {
                        health: 6
                    }
                }
            ]
        };
    },
    created() {
        if (functions.storage('get', 'party')) {
            this.initialWindow = false;
            this.party = functions.storage('get', 'party');
        }
    },
    methods: {
        randomizeName(memberId) {
            const index = this.party.findIndex((member) => member.id === memberId);

            const names = ['Cloud', 'Barret', 'Biggs', 'Jessie', 'Wedge', 'Yuffie', 'Luna'];

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
            // Saving token in localStorage after how many days it should expire
            // 604800000 = 7 * 90 days
            functions.storage('set', 'party', this.party, 604800000 * 90);
        },
        checkNames() {
            let num = 1;

            for (const member of this.party) {
                if (!member.name) {
                    console.log(`member of party nr. ${num} name missing`);
                    return false;
                }

                if (!member.name) {
                    console.log(`member of party nr. ${num} name missing`);
                    return false;
                }

                if (!member.class) {
                    console.log(`member of party nr. ${num} class is not set`);
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