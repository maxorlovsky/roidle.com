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
                    text: this.$t('tutorial.tutorialText1')
                },
                {
                    text: this.$t('tutorial.tutorialText2')
                },
                {
                    text: this.$t('tutorial.tutorialText3'),
                    element: '.char-info',
                    position: true
                },
                {
                    text: this.$t('tutorial.tutorialText4'),
                    element: '.game__party',
                    position: true
                },
                {
                    text: this.$t('tutorial.tutorialText5'),
                    element: '.game__additions'
                },
                {
                    text: this.$t('tutorial.tutorialText6'),
                    element: '.game__actions',
                    modal: 'modal--down'
                },
                {
                    text: this.$t('tutorial.tutorialText7'),
                    element: '.chat',
                    modal: 'modal--up'
                },
                {
                    text: this.$t('tutorial.tutorialText8'),
                    element: '.docked-menu'
                },
                {
                    text: this.$t('tutorial.tutorialText9'),
                    element: '.docked-menu'
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