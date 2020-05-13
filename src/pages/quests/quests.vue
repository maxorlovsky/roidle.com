<template>
    <section class="quests">
        <div class="quests-wrapper">
            <div v-if="selectedMission"
                class="quests-details"
            >
                <div class="quests-details__info">
                    <div class="quests-details__info__icon">
                        <img v-if="selectedMission.image"
                            :src="`/dist/assets/${selectedMission.image}`"
                        >
                    </div>
                    <div class="quests-details__info__name">{{ selectedMission.name }}</div>
                </div>
                <div class="quests-details__rewards">Rewards: {{ selectedMission.rewards }}</div>
                <div class="quests-details__text"
                    v-html="currentDialogText"
                />
                <div v-if="neededProgress"
                    class="quests-details__progress"
                >{{ currentProgress }} / {{ neededProgress }}</div>
                <div class="quests-details__actions">
                    <button v-if="selectedMissionAction"
                        :disabled="loading"
                        class="btn btn-success"
                        @click="completeQuest()"
                    >End discussion</button>
                    <button v-else
                        :disabled="loading"
                        class="btn game-button"
                        @click="proceedWithQuest()"
                    >Next</button>
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
                            :src="`/dist/assets/${quest.image}`"
                        >
                    </div>
                    <div class="quests-list__quest__info">
                        <div class="quests-list__quest__info__name">{{ quest.name }}</div>
                        <div class="quests-list__quest__info__description">{{ quest.description }}</div>
                        <div class="quests-list__quest__info__rewards">{{ quest.rewards }}</div>
                    </div>
                    <div class="quests-list__quest__buttons">
                        <button v-if="quest.currentStep === 1"
                            :disabled="loading"
                            class="btn game-button"
                            @click="reviewQuest(quest.id)"
                        >Start</button>
                        <button v-else
                            :disabled="loading"
                            class="btn btn-warning"
                            @click="reviewQuest(quest.id)"
                        >View</button>
                    </div>
                </div>
            </div>

            <div v-if="displayNPC"
                class="quests-npc"
            >
                <img :src="`/dist/assets/${displayNPC}`">
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

const questsPage = {
    data() {
        return {
            loading: false,
            quests: [],
            displayNPC: null,
            selectedMission: null,
            currentDialogStep: 0,
            currentDialogText: '',
            selectedMissionAction: 0,
            currentProgress: 0,
            neededProgress: null
        };
    },
    computed: {
        ...mapGetters([
            'characterLocationId',
            'characterBaseLevel',
            'characterJob',
            'characterName'
        ])
    },
    mounted() {
        mo.socket.on('finishQuestComplete', () => {
            // Refetching quests
            mo.socket.emit('fetchQuests');

            this.closeQuest();
        });

        mo.socket.on('fetchQuestsComplete', (response) => {
            this.loading = false;

            this.quests = response;
        });

        mo.socket.on('reviewQuestComplete', (response) => {
            this.loading = false;

            if (response) {
                this.showQuest(response);
            }
        });

        // Sending request to fetch available quests for the character
        mo.socket.emit('fetchQuests');

        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('finishQuestComplete');
        mo.socket.off('fetchQuestsComplete');
        mo.socket.off('reviewQuestComplete');

        this.$store.commit('showChat', true);
    },
    methods: {
        showQuest(quest) {
            this.selectedMission = quest;

            // In case there is an illustration for NPC, we show it
            if (quest.npcImage) {
                this.displayNPC = quest.npcImage;
            }

            if (quest.neededProgress >= 0) {
                this.currentProgress = quest.currentProgress;
                this.neededProgress = quest.neededProgress;
            }

            this.currentDialogStep = 0;
            this.currentDialogText = this.transformText(this.selectedMission.steps[this.selectedMission.currentStep].messages[this.currentDialogStep]);

            // When displaying quest, we need to identify which button to display
            this.checkQuestAction();
        },
        reviewQuest(questId) {
            this.loading = true;

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

            // Trigger check if there will be another dialog or we should finish
            this.checkQuestAction();
        },
        completeQuest() {
            this.loading = true;

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