<template>
    <section class="quests">
        <div v-if="loading"
            class="quests-wrapper"
        >
            <loading />
        </div>
        <div class="quests-wrapper">
            <div v-if="selectedMission"
                class="quests-details"
            >
                <div class="quests-details__info">
                    <div class="quests-details__info__icon">
                        <img v-if="selectedMission.image"
                            :src="`${serverUrl}/dist/assets/${selectedMission.image}`"
                        >
                    </div>
                    <div class="quests-details__info__name">{{ selectedMission.name }}</div>
                </div>
                <div class="quests-details__rewards">{{ $t('quests.rewards') }}: {{ selectedMission.rewards }}</div>
                <div class="quests-details__text"
                    v-html="currentDialogText"
                />
                <div v-if="neededProgress && selectedMission.currentStep"
                    class="quest-progress-bar quests-details__progress"
                >
                    <span>{{ currentProgress }} / {{ neededProgress }}</span>

                    <div class="quest-progress-bar__bar">
                        <div :style="{ 'width': calcualteProgressPercentage(currentProgress, neededProgress) + '%' }"
                            class="quest-progress-bar__bar__current"
                        />
                    </div>
                </div>
                <template v-else-if="toCompleteProgress && selectedMission.currentStep">
                    <div v-for="(progress, index) in toCompleteProgress"
                        :key="index"
                        class="quest-progress-bar-new quest-progress-bar-new--preview"
                    >
                        <span class="quest-progress-bar-new__label">{{ progress.label }}</span>
                        <span class="quest-progress-bar-new__amount">{{ progress.currentAmount }} / {{ progress.requiredAmount }}</span>

                        <div class="quest-progress-bar-new__bar">
                            <div :style="{ 'width': calcualteProgressPercentage(progress.currentAmount, progress.requiredAmount) + '%' }"
                                class="quest-progress-bar-new__bar__current"
                            />
                        </div>
                    </div>
                </template>

                <div v-if="choices.displayChoices"
                    class="quests-quiz"
                >
                    <div v-for="(choice, choiceIndex) in choices.selection"
                        :key="choice"
                        :class="{ 'quests-quiz__answer--selected': choices.selected === choiceIndex }"
                        class="quests-quiz__answer"
                        @click="choices.selected = choiceIndex"
                    >
                        {{ choice }}
                    </div>
                </div>

                <div v-if="quiz.questions.length"
                    class="quests-quiz"
                >
                    <div v-for="(question, questionIndex) in quiz.questions"
                        v-show="quiz.currentlyViewedQuestion === questionIndex"
                        :key="question.question"
                        class="quests-quiz__item"
                    >
                        <div class="quests-quiz__question">{{ question.question }}</div>
                        <div v-for="(answer, answerIndex) in question.answers"
                            :key="answer"
                            :class="{ 'quests-quiz__answer--selected': quiz.answers[question.questionNr] === answerIndex }"
                            class="quests-quiz__answer"
                            @click="selectQuizAnswer(question.questionNr, answerIndex)"
                        >{{ answer }}</div>
                    </div>

                    <div class="quests-quiz__actions">
                        <button :disabled="buttonLoading || quiz.currentlyViewedQuestion === 0"
                            class="btn btn-secondary"
                            @click="quiz.currentlyViewedQuestion--"
                        >{{ $t('quests.prev') }}</button>

                        <button :disabled="buttonLoading || quiz.currentlyViewedQuestion === quiz.questions.length - 1"
                            class="btn btn-secondary"
                            @click="quiz.currentlyViewedQuestion++"
                        >{{ $t('quests.next') }}</button>
                    </div>
                </div>

                <div class="quests-details__actions">
                    <button v-if="selectedMissionAction"
                        :disabled="isDiabled"
                        class="btn btn-success"
                        @click="completeQuest()"
                    >{{ $t('quests.endDiscussions') }}</button>
                    <button v-else
                        :disabled="isDiabled"
                        class="btn game-button"
                        @click="proceedWithQuest()"
                    >{{ $t('quests.next') }}</button>
                </div>
            </div>
            <div v-else
                class="quests-list"
            >
                <div v-for="quest in quests"
                    :key="quest.id"
                    class="quests-list__quest"
                >
                    <div class="quests-list__quest__icon">
                        <img v-if="quest.image"
                            :src="`${serverUrl}/dist/assets/${quest.image}`"
                        >
                    </div>
                    <div class="quests-list__quest__info">
                        <div class="quests-list__quest__info__name">{{ quest.name }}</div>
                        <div class="quests-list__quest__info__description">{{ quest.description }}</div>
                        <div class="quests-list__quest__info__rewards">{{ quest.rewards }}</div>

                        <div v-if="quest.currentStep > 1 && quest.neededProgress"
                            class="quest-progress-bar"
                        >
                            <span>{{ quest.currentProgress }} / {{ quest.neededProgress }}</span>

                            <div class="quest-progress-bar__bar">
                                <div :style="{ 'width': calcualteProgressPercentage(quest.currentProgress, quest.neededProgress) + '%' }"
                                    class="quest-progress-bar__bar__current"
                                />
                            </div>
                        </div>
                        <template v-else-if="quest.currentStep > 1 && quest.toCompleteProgress">
                            <div v-for="(progress, index) in quest.toCompleteProgress"
                                :key="index"
                                class="quest-progress-bar-new"
                            >
                                <span class="quest-progress-bar-new__label">{{ progress.label }}</span>
                                <span class="quest-progress-bar-new__amount">{{ progress.currentAmount }} / {{ progress.requiredAmount }}</span>

                                <div class="quest-progress-bar-new__bar">
                                    <div :style="{ 'width': calcualteProgressPercentage(progress.currentAmount, progress.requiredAmount) + '%' }"
                                        class="quest-progress-bar-new__bar__current"
                                    />
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="quests-list__quest__buttons">
                        <button v-if="quest.currentStep === 1"
                            :disabled="buttonLoading"
                            class="btn game-button"
                            @click="reviewQuest(quest.id)"
                        >{{ $t('quests.start') }}</button>
                        <button v-else
                            :disabled="buttonLoading"
                            class="btn btn-warning"
                            @click="reviewQuest(quest.id)"
                        >{{ $t('quests.view') }}</button>
                    </div>
                </div>
            </div>

            <div v-if="displayNPC"
                class="quests-npc"
            >
                <img :src="`${serverUrl}/dist/assets/${displayNPC}`">
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { set } from 'vue';
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

// Utilities
import { addEmotes } from '@utils/chat.js';

const questsPage = {
    components: {
        loading,
    },
    data() {
        // Need to add params to reset
        // Of this.closeQuest()

        return {
            loading: true,
            buttonLoading: false,
            quests: [],
            displayNPC: null,
            selectedMission: null,
            currentDialogStep: 0,
            currentDialogText: '',
            selectedMissionAction: 0,
            currentProgress: 0,
            neededProgress: null,
            completeQuestClose: false,
            toCompleteProgress: null,
            quiz: {
                questions: [],
                answers: [],
                currentlyViewedQuestion: 0,
                everyThingAnswered: false
            },
            choices: {
                displayChoices: false,
                selection: [],
                selected: -1
            },
        };
    },
    computed: {
        ...mapGetters([
            'characterLocationId',
            'characterBaseLevel',
            'characterJob',
            'characterName',
            'serverUrl'
        ]),

        isDiabled() {
            return this.buttonLoading ||
                (this.quiz.questions.length > 0 && !this.quiz.everyThingAnswered) ||
                (this.choices.displayChoices && this.choices.selected < 0);
        }
    },
    mounted() {
        mo.socket.on('finishQuestComplete', () => {
            // Creating a flag to close quest when load finishes
            this.completeQuestClose = true;

            // Refetching quests
            mo.socket.emit('fetchQuests');
        });

        mo.socket.on('fetchQuestsComplete', (response) => {
            this.loading = false;
            this.buttonLoading = false;

            this.quests = response;

            if (this.completeQuestClose) {
                this.completeQuestClose = false;
                this.closeQuest();
            }
        });

        mo.socket.on('reviewQuestComplete', (response) => {
            this.buttonLoading = false;

            if (response) {
                this.showQuest(response);
            }
        });

        // Sending request to fetch available quests for the character
        mo.socket.emit('fetchQuests');
    },
    beforeDestroy() {
        mo.socket.off('finishQuestComplete');
        mo.socket.off('fetchQuestsComplete');
        mo.socket.off('reviewQuestComplete');
    },
    methods: {
        selectQuizAnswer(questionNr, answerNr) {
            set(this.quiz.answers, questionNr, answerNr);

            // Check if all answered were marked
            const checkIfAllAnswered = this.quiz.answers.find((answer) => answer === -1);

            // In case -1 results not found, that means all is good and everything was answered
            if (!checkIfAllAnswered) {
                this.quiz.everyThingAnswered = true;
            }
        },
        calcualteProgressPercentage(currentProgress, neededProgress) {
            let percentage = Math.floor(currentProgress / neededProgress * 100) || 0;

            if (percentage > 100) {
                percentage = 100;
            }

            return percentage;
        },
        showQuest(quest) {
            this.selectedMission = quest;

            if (quest.neededProgress >= 0) {
                this.currentProgress = quest.currentProgress;
                this.neededProgress = quest.neededProgress;
            }

            // Put new completion progress info into the new quest variable
            this.toCompleteProgress = quest.toCompleteProgress;

            // In case there's a quiz required for the quest, prepare varaibles for it
            if (quest.quizQuest) {
                this.quiz.questions = quest.quizQuest;

                // Generate proper array for answer, for vuex to recognize reactivity
                for (const question of quest.quizQuest) {
                    this.quiz.answers[question.questionNr] = -1;
                }
            }

            this.currentDialogStep = 0;
            this.currentDialogText = this.transformText(this.selectedMission.steps[this.selectedMission.currentStep].messages[this.currentDialogStep]);

            // In case there is an illustration for NPC for the first step, we show it
            if (this.selectedMission.steps[this.selectedMission.currentStep].npcImage) {
                this.displayNPC = this.selectedMission.steps[this.selectedMission.currentStep].npcImage;
            }

            // In case there are choices for the player in the quest, we apply them
            if (this.selectedMission.steps[this.selectedMission.currentStep].choices && this.selectedMission.steps[this.selectedMission.currentStep].choices.length) {
                this.choices.selection = this.selectedMission.steps[this.selectedMission.currentStep].choices;
            }

            // When displaying quest, we need to identify which button to display
            this.checkQuestAction();
        },
        reviewQuest(questId) {
            this.buttonLoading = true;

            mo.socket.emit('reviewQuest', questId);
        },
        checkQuestAction() {
            const checkNextDialogStep = this.currentDialogStep + 1;

            // We need to check which action user will have next with the quest
            // Check if there is a next dialog after this one
            if (this.selectedMission.steps[this.selectedMission.currentStep].messages[checkNextDialogStep]) {
                this.selectedMissionAction = 0;
            } else {
                // Check on the last step if there is a choise needed and display it if that's the case
                if (this.choices.selection.length) {
                    this.choices.displayChoices = true;
                }

                this.selectedMissionAction = 1;
            }
        },
        proceedWithQuest() {
            // If selected action is one, we identified that there is another quest dialog that need to appear, do exactly that
            // Increment dialog text to the next one
            this.currentDialogStep += 1;

            // Transform text for any type of variables
            const text = this.transformText(this.selectedMission.steps[this.selectedMission.currentStep].messages[this.currentDialogStep]);

            this.currentDialogText = text;

            // In case there is an illustration for NPC for the first step, we show it
            if (this.selectedMission.steps[this.selectedMission.currentStep].npcImage) {
                this.displayNPC = this.selectedMission.steps[this.selectedMission.currentStep].npcImage;
            }

            // Trigger check if there will be another dialog or we should finish
            this.checkQuestAction();
        },
        completeQuest() {
            this.buttonLoading = true;

            mo.socket.emit('finishQuest', {
                selectedMissionId: this.selectedMission.id,
                quizAnswers: this.quiz.answers.length ? this.quiz.answers : null,
                choiceIndex: this.choices.selected >= 0 ? this.choices.selected : null,
            });
        },
        closeQuest() {
            // Reset the quest
            this.displayNPC = null;
            this.selectedMission = null;
            this.currentDialogStep = 0;
            this.currentDialogText = '';
            this.selectedMissionAction = 0;
            this.currentProgress = 0;
            this.neededProgress = null;
            this.completeQuestClose = false;
            this.toCompleteProgress = null;
            this.quiz = {
                questions: [],
                answers: [],
                currentlyViewedQuestion: 0,
                everyThingAnswered: false
            };
            this.choices = {
                displayChoices: false,
                selection: [],
                selected: -1
            };
        },
        transformText(text) {
            // Update name variable with character name
            text = text.replace(/{name}/g, this.characterName)
                .replace(/\[/g, '<span class="quests--blue-color">[')
                .replace(/\]/g, ']</span>')
                .replace(/(\n)/g, '<br>');

            text = addEmotes(text);

            return text;
        }
    }
};

// Routing
mo.routes.push({
    path: '/quests',
    component: questsPage
});

export default questsPage;
</script>