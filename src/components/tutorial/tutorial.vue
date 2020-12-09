<template>
    <div class="tutorial">
        <div :class="modalPosition"
            class="modal"
        >
            <div class="modal__header">{{ $t('tutorial.tutorial') }}</div>
            <div class="modal__content kafra-actions__buttons"
                v-html="displayedText"
            />
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeTutorial()"
                >{{ $t('global.close') }}</button>

                <button class="btn game-button"
                    @click="nextStep()"
                >{{ $t('tutorial.next') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'tutorial',
    data() {
        return {
            steps: [
                {
                    text: this.$t('tutorialText1')
                },
                {
                    text: this.$t('tutorialText2')
                },
                {
                    text: this.$t('tutorialText3'),
                    element: '.char-info',
                    position: true
                },
                {
                    text: this.$t('tutorialText4'),
                    element: '.game__party',
                    position: true
                },
                {
                    text: this.$t('tutorialText5'),
                    element: '.game__settings'
                },
                {
                    text: this.$t('tutorialText6'),
                    element: '.game__hunt-config'
                },
                {
                    text: this.$t('tutorialText7'),
                    element: '.game__actions',
                    modal: 'modal--down'
                },
                {
                    text: this.$t('tutorialText8'),
                    element: '.chat',
                    modal: 'modal--up'
                },
                {
                    text: this.$t('tutorialText9'),
                    element: '.docked-menu__button--character'
                },
                {
                    text: this.$t('tutorialText10'),
                    element: '.docked-menu__button--map'
                },
                {
                    text: this.$t('tutorialText11'),
                    element: '.docked-menu__button--quests'
                },
                {
                    text: this.$t('tutorialText12'),
                    element: '.docked-menu__button--inventory'
                },
                {
                    text: this.$t('tutorialText13'),
                    element: '.docked-menu__button--quests'
                }
            ],
            displayedText: '',
            currentStep: 0,
            storedZIndex: null,
            storedPosition: null,
            modalPosition: ''
        };
    },
    mounted() {
        this.displayedText = this.steps[0].text;
    },
    methods: {
        closeTutorial() {
            this.$store.commit('closeTutorial');
        },
        nextStep() {
            this.modalPosition = '';

            if (this.steps[this.currentStep].element) {
                this.resetHighlight(this.steps[this.currentStep].element, this.steps[this.currentStep].position);
            }

            this.currentStep += 1;

            // In case there are no next step, close tutorial
            if (!this.steps[this.currentStep]) {
                this.closeTutorial();

                return false;
            }

            this.displayedText = this.steps[this.currentStep].text;

            if (this.steps[this.currentStep].element) {
                this.highlightElement(this.steps[this.currentStep].element, this.steps[this.currentStep].position);
            }

            if (this.steps[this.currentStep].modal) {
                this.modalPosition = this.steps[this.currentStep].modal;
            }
        },
        highlightElement(className, position) {
            this.storedZIndex = document.querySelector(className).style.zIndex;
            document.querySelector(className).style.zIndex = 150;

            if (position) {
                this.storedPosition = document.querySelector(className).style.position;
                document.querySelector(className).style.position = 'relative';
            }
        },
        resetHighlight(className, position) {
            document.querySelector(className).style.zIndex = this.storedZIndex;
            this.storedZIndex = null;

            if (position) {
                document.querySelector(className).style.position = this.storedPosition;
                this.storedPosition = null;
            }
        }
    }
};
</script>