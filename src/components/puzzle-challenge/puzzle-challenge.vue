<template>
    <div class="puzzle-challenge">
        <div class="modal">
            <div class="modal__header">Challenge / Puzzle</div>

            <div v-if="loading"
                class="modal__content"
            >
                <loading />
            </div>
            <div v-else
                class="modal__content"
            >
                <div class="puzzle-challenge__text">
                    {{ randomChallengeText[randomTextNr] }}
                </div>

                <div class="puzzle-challenge__challenge">
                    <b v-html="puzzleChallenge" />
                </div>

                <div class="puzzle-challenge__answer">
                    <input v-model="challengeAnswer"
                        type="text"
                    >
                </div>
            </div>

            <div v-if="!loading"
                class="modal__buttons puzzle-challenge__buttons"
            >
                <button :disabled="buttonLoading"
                    class="btn game-button"
                    @click="submitChallenge()"
                >Submit</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

export default {
    name: 'puzzle-challenge',
    components: {
        loading
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            randomChallengeText: [
                'You\'re feeling a bit lost, just some parts of the dungeon feels familiar, you are tried hard to navigate your way into the depths of this place. As if there is some kind of puzzle that need to be solved?',
                'You\'ve reached the stairs to the next level, at least that is what you think, but there are more stairs leading down, which one to choose? You need to solve this puzzle somehow.',
                'Are you on the right path? You were sure that you memorized the map of the dungeon very well before dwelling into it.',
            ],
            randomTextNr: 0,
            challengeAnswer: ''
        };
    },
    computed: {
        ...mapGetters([
            'puzzleChallenge',
            'puzzleChallengeNr'
        ])
    },
    watch: {
        puzzleChallenge: {
            immediate: true,
            handler() {
                // When puzzle challenge finally updated in the vuex, we remove the loading
                if (this.puzzleChallenge) {
                    this.loading = false;
                } else {
                    this.loading = true;
                }
            }
        }
    },
    mounted() {
        this.randomTextNr = Math.floor(Math.random() * this.randomChallengeText.length);

        mo.socket.on('challengeReplyComplete', (response) => {
            this.buttonLoading = false;

            // "Stopping" the travel and reset the timer
            this.$store.commit('travelingComplete');

            // Remove challenge
            this.$store.commit('puzzleChallenge', {
                puzzleText: '',
                puzzleNr: 0
            });

            // If challenge failed we need to request getTravel again
            if (!response) {
                mo.socket.emit('getTravel');
            }
        });
    },
    methods: {
        submitChallenge() {
            this.buttonLoading = true;

            mo.socket.emit('travelChallengeReply', {
                challengeNr: this.puzzleChallengeNr,
                answer: this.challengeAnswer
            });
        },
    }
};
</script>