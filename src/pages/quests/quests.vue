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
                <div v-if="neededProgress"
                    class="quest-progress-bar quests-details__progress"
                >
                    <span>{{ currentProgress }} / {{ neededProgress }}</span>

                    <div class="quest-progress-bar__bar">
                        <div :style="{ 'width': calcualteProgressPercentage(currentProgress, neededProgress) + '%' }"
                            class="quest-progress-bar__bar__current"
                        />
                    </div>
                </div>
                <div class="quests-details__actions">
                    <button v-if="selectedMissionAction"
                        :disabled="buttonLoading"
                        class="btn btn-success"
                        @click="completeQuest()"
                    >{{ $t('quests.endDiscussions') }}</button>
                    <button v-else
                        :disabled="buttonLoading"
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
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const questsPage = {
    components: {
        loading,
    },
    data() {
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
            completeQuestClose: false
        };
    },
    computed: {
        ...mapGetters([
            'characterLocationId',
            'characterBaseLevel',
            'characterJob',
            'characterName',
            'serverUrl'
        ])
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

            this.currentDialogStep = 0;
            this.currentDialogText = this.transformText(this.selectedMission.steps[this.selectedMission.currentStep].messages[this.currentDialogStep]);

            // In case there is an illustration for NPC for the first step, we show it
            if (this.selectedMission.steps[this.selectedMission.currentStep].npcImage) {
                this.displayNPC = this.selectedMission.steps[this.selectedMission.currentStep].npcImage;
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

            mo.socket.emit('finishQuest', this.selectedMission.id);
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
        },
        transformText(text) {
            // Update name variable with character name
            text = text.replace(/{name}/g, this.characterName)
                .replace(/\[/g, '<span class="quests--blue-color">[')
                .replace(/\]/g, ']</span>')
                .replace(/(\n)/g, '<br>');

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