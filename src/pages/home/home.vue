<template>
    <div class="home">
        <input v-model="name"
            type="text"
            class="character-name"
            placeholder="What is your name?"
        >

        <div class="character-view">
            <avatar :head-style="headStyle"
                :gender="gender"
            />

            <div class="character-pickers">
                <div class="character-pickers__buttons">
                    <Button class="btn btn-secondary"
                        @click="setGender(0)"
                    >Male</Button>
                    <Button class="btn btn-secondary"
                        @click="setGender(1)"
                    >Female</Button>
                </div>
                <div class="character-pickers__buttons">
                    <Button class="btn btn-secondary"
                        @click="setStyle('prev')"
                    > &#60; </Button>
                    <Button class="btn btn-secondary"
                        @click="setStyle('next')"
                    > &#62; </Button>
                </div>
            </div>
        </div>

        <div v-if="message"
            class="home__message"
        >{{ message }}</div>

        <button class="home__proceed btn btn-warning btn-lg"
            @click="proceed()"
        >Proceed</button>

        <stats :stats="characterStats"
            :status-points="characterStatusPoints"
            :job-id="characterJobId"
            :base-level="characterBaseLevel"
            :job-level="characterJobLevel"
            :hide-params="true"
        />

        <div class="home__stats-explanation">
            <p>
                <b>Strength (STR)</b>: This stat affects the physical power of the character, be that of melee or range, melee benefit more from Strength than range.<br>
                Primary stat for jobs: <b>Fighter, Thief</b><br>
                Secondary stat for jobs: <b>Archer, Merchant</b>
            </p>
            <p>
                <b>Dexterity (DEX)</b>: This stat affects the speed of how fast character can finish missions. Speed affects whole party. This stat affect physical power of the character, range though benefit more from this stat.<br>
                Primary stat for jobs: <b>Archer, Thief</b>
            </p>
            <p>
                <b>Intellect (INT)</b>: This stat affects the mental power of the character, allowing to deal massive magic damage<br>
                Primary stat for jobs: <b>Mage</b>
            </p>
            <p>
                <b>Vitality (VIT)</b>: This stat affects the physical defense and HP and is a mandatory stat for protectors<br>
                Secondary stat for jobs: <b>Fighter</b>
            </p>
            <p>
                <b>Wisdom (WIS)</b>: This stat affects the healing capabilities of acolyte, magical defense and MP<br>
                Primary stat for jobs: <b>Acolyte</b><br>
                Secondary stat for jobs: <b>Mage</b>
            </p>
            <p>
                <b>Luck (LUK)</b>: This stat affects the luck of a character in many way, primarily it is used for crafts<br>
                Primary stat for jobs: <b>Merchant</b><br>
                Secondary stat for jobs: <b>Thief</b>
            </p>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '../../components/avatar/avatar.vue';
import stats from '../../components/stats/stats.vue';

const homePage = {
    components: {
        avatar,
        stats
    },
    data() {
        return {
            name: 'Guest_0.8723746799143453',
            gender: 'm',
            headStyle: 1,
            message: ''
        };
    },
    computed: {
        ...mapGetters(['characterStats', 'characterStatusPoints', 'characterBaseLevel', 'characterJobLevel', 'characterJobId'])
    },
    mounted() {
        mo.socket.on('completeRegistrationResponse', (params) => {
            if (params.status) {
                this.$store.commit('setCharacterData', {
                    name: this.name,
                    gender: this.gender,
                    headStyle: this.headStyle
                });

                this.$store.commit('displayDockedMenu', true);

                this.$router.replace('/game');
            } else {
                this.message = params.message;
            }
        });
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
        proceed() {
            if (!this.checkName()) {
                return false;
            }

            mo.socket.emit('completeRegistration', {
                name: this.name,
                gender: this.gender,
                headStyle: this.headStyle
            });
        },
        checkName() {
            if (!this.name) {
                console.error('Name missing');

                return false;
            }

            const reg = /^\w+$/g;

            if (!reg.test(this.name)) {
                console.error('Name is incorrect');

                return false;
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