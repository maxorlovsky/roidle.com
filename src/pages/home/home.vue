<template>
    <div class="home">
        <template v-if="step === 2">
            <p>Let's distribute your initial stats and how you will appear to others</p>

            <div class="character-view">
                <div class="character-view__head"><img :src="`/dist/assets/images/heads/${headStyle}_${gender}.gif`"></div>
                <div class="character-view__body"><img :src="`/dist/assets/images/bodies/novice_${gender}_0.png`"></div>
                <div class="character-pickers">
                    <div class="character-pickers__buttons">
                        <Button @click="setGender(0)">Male</Button>
                        <Button @click="setGender(1)">Female</Button>
                    </div>
                    <div class="character-pickers__buttons">
                        <Button @click="setStyle('prev')"> &#60; </Button>
                        <Button @click="setStyle('next')"> &#62; </Button>
                    </div>
                </div>
            </div>

            <stats :stats="stats"
                :status-points="statusPoints"
                :job-id="0"
                :job-level="1"
            />

            <button @click="saveStats()">Proceed</button>
        </template>
        <template v-else>
            <p>Welcome to the world of "Max". In this world society is a whole and danger doesn't come from fighting each other, it's coming from monsters that. In this world, there are still people who crave for extreme and adventure, you are one of those adventurers. Beginner adventurer, tell me your name.</p>

            <input v-model="name"
                type="text"
            >

            <button @click="saveName()">Proceed</button>
        </template>
    </div>
</template>

<script>
// Globals functions
import { functions } from '../../functions.js';

// Components
import stats from '../../components/stats/stats.vue';

const homePage = {
    components: {
        stats
    },
    data() {
        return {
            step: 1,
            name: '',
            stats: {
                str: 1,
                dex: 1,
                int: 1,
                vit: 1,
                wis: 1,
                luk: 1
            },
            statusPoints: 48,
            headStyle: 1,
            gender: 'm'
        };
    },
    created() {
        this.recalculateStatCosts();
    },
    methods: {
        setStyle(pos) {
            let style = 0;

            switch (pos) {
                case 'prev':
                    style = this.headStyle - 1;
                    break;
                default:
                    style = this.headStyle + 1;
                    break;
            }

            if (style < 1) {
                style = 3;
            } else if (style > 3) {
                style = 1;
            }

            this.headStyle = style;
        },
        setGender(gender) {
            switch (gender) {
                case 1:
                    this.gender = 'f';
                    break;
                default:
                    this.gender = 'm';
                    break;
            }

            this.headStyle = 1;
        },
        proceed(step) {
            this.step = step;
        },
        saveStats() {
            const character = {
                name: this.name,
                gender: this.gender,
                headStyle: this.headStyle,
                stats: this.stats,
                statusPoints: this.statusPoints
            };

            this.$store.commit('updateCharacterData', character);

            // Saving token in localStorage after how many days it should expire
            functions.storage('set', 'character', character, 604800000 * 90);

            this.$store.commit('displayDockedMenu', true);

            this.$router.replace('/game');
        },
        saveName() {
            this.$store.commit('saveCharacterName', this.name);

            this.proceed(2);
        }
        /* 1 checkNames() {
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
        } */
    }
};

// Routing
mo.routes.push({
    path: '/',
    component: homePage
});

export default homePage;
</script>