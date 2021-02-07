<template>
    <div class="puzzle-challenge">
        <div class="modal">
            <div class="modal__header">{{ $t('puzzle.actionTitle') }}</div>

            <div v-if="loading"
                class="modal__content"
            >
                <loading />
            </div>
            <div v-else-if="puzzleChallengeLeader"
                class="modal__content"
            >
                {{ $t('puzzle.leaderNavigating') }}
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

            <div v-if="!loading && !puzzleChallengeLeader"
                class="modal__buttons puzzle-challenge__buttons"
            >
                <button :disabled="buttonLoading"
                    class="btn game-button"
                    @click="submitChallenge()"
                >{{ $t('puzzle.submit') }}</button>
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
                this.$t('puzzle.randomChallengeText1'),
                this.$t('puzzle.randomChallengeText2'),
                this.$t('puzzle.randomChallengeText3')
            ],
            randomTextNr: 0,
            challengeAnswer: ''
        };
    },
    computed: {
        ...mapGetters([
            'puzzleChallenge',
            'puzzleChallengeNr',
            'puzzleChallengeLeader'
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
            this.$store.commit('puzzleChallengeReset');

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