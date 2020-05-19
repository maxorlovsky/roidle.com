<template>
    <div class="tutorial">
        <div :class="modalPosition"
            class="modal"
        >
            <div class="modal__header">Tutorial</div>
            <div class="modal__content kafra-actions__buttons"
                v-html="displayedText"
            />
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeTutorial()"
                >Close</button>

                <button class="btn game-button"
                    @click="nextStep()"
                >Next</button>
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
                    text: 'Hey there, you seems to be new here. Let me show you around really fast for you not to get lost from the very beginning.'
                },
                {
                    text: 'This is your general user interface and this small screen is how this game runs, it is optimized for mobile play. And you know about <b>Early Access</b> games? Well this one is <b><u>Early</u> Early Access</b> game! So please be patient when playing it. And in case you have great idea - send it to developer on discord or you want to say that this game is shit? Also do it on discord, apreciated any way!'
                },
                {
                    text: 'This is your main character info, it will be with you through all out the game, so you could see everything what is happening with your character or in case you\'re traveling or hunting',
                    element: '.char-info',
                    position: true
                },
                {
                    text: 'This is your party screen. Party doesn\'t work at the moment, expect it to start functionining in the release of 0.3',
                    element: '.party',
                    position: true
                },
                {
                    text: 'This is your settings screen, music or sound too loud or annoying? You can turn it off in there. Or you can switch fast between your characters from here.',
                    element: '.game__settings'
                },
                {
                    text: 'Here are your main game actions, they are used to hunt, to shop, to store items, save your location and basically for all random stuff in the game',
                    element: '.game__actions',
                    modal: 'modal--down'
                },
                {
                    text: 'Your chat. Chat is NOT persistent meaning you will lose all of chat logs on page refresh. Regular chat to talk with players. System chat for messages like what you used, what you equiped, sold, error messages and Battle chat for battle logs.',
                    element: '.chat',
                    modal: 'modal--up'
                },
                {
                    text: 'In here you will find everything related to your character. Equipment, stats, skills, attributes and everything character related',
                    element: '.docked-menu__button--character'
                },
                {
                    text: 'This is map, from here you navigate around the world',
                    element: '.docked-menu__button--map'
                },
                {
                    text: 'Here are your quests, main line quests, job change quest (when you reach Job Level to 10), random daily quests that drop every day at 4:00 UTC',
                    element: '.docked-menu__button--quests'
                },
                {
                    text: 'Your inventory. In here you can see what are you carrying with you at the time, you can also use any healing items from it or discard items from your inventory, but be careful, discarded items are lost forever.',
                    element: '.docked-menu__button--inventory'
                },
                {
                    text: 'That is it. <b>IMPORTANT!</b> You should start with quests though, as there it explains you how to start playing in a bit of a narrative way. Also you will receive your first weapon! Good luck and thank you for playing!',
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