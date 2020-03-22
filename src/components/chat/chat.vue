<template>
    <section class="chat">
        <div class="chat-wrapper">
            <div class="chat__tabs">
                <div :class="{'chat__tabs__tab--selected': selectedTab === 0, 'chat__tabs__tab--notification': tabNotification[0]}"
                    class="chat__tabs__tab"
                    @click="selectedTab = 0; tabNotification[0] = false"
                >Regular chat</div>
                <div :class="{'chat__tabs__tab--selected': selectedTab === 1, 'chat__tabs__tab--notification': tabNotification[1]}"
                    class="chat__tabs__tab"
                    @click="selectedTab = 1; tabNotification[1] = false"
                >Battle chat</div>
            </div>
            <div v-show="selectedTab === 0"
                ref="chatBody"
                class="chat__body"
            >
                <p v-for="(chat, index) in chatLog"
                    :key="index"
                    :class="`chat__body__${chat.type}`"
                >[ #{{ chat.type }} ] <span @click="whisperName = chat.character">{{ chat.character }}</span> : {{ chat.message }}</p>
            </div>
            <div v-show="selectedTab === 1"
                ref="chatBodyBattle"
                class="chat__body"
            >
                <p v-for="(chat, index) in battleChatLog"
                    :key="index"
                >{{ chat.message }}</p>
            </div>
            <div class="chat__input">
                <input v-model="whisperName"
                    type="text"
                    class="chat__input__whisper"
                >
                <input v-model="message"
                    type="text"
                    class="chat__input__message"
                >
                <button class="btn btn-primary btn-sm chat__input__button">&#62;</button>

                <div v-if="disabledChat"
                    class="chat__input__limit"
                >Need Basic Level 1 to use chat</div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'chat',
    data() {
        return {
            whisperName: '',
            message: '',
            chatLog: [],
            battleChatLog: [],
            disabledChat: true,
            selectedTab: 0,
            tabNotification: [false, false]
        };
    },
    computed: {
        ...mapGetters(['characterSkills', 'chatContent', 'socketConnection'])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[1] >= 1) {
                    this.disabledChat = false;
                }
            }
        },
        chatContent() {
            for (const chat of this.chatContent) {
                if (chat.type === 'battle') {
                    if (this.selectedTab !== 1) {
                        this.tabNotification[1] = true;
                    }

                    this.battleChatLog.push({
                        message: chat.message
                    });
                } else {
                    if (this.selectedTab !== 0) {
                        this.tabNotification[0] = true;
                    }

                    this.chatLog.push({
                        type: chat.type,
                        character: chat.character,
                        message: chat.message
                    });
                }
            }

            this.scrollChat();
        }
    },
    beforeDestroy() {
        mo.socket.off('chat');
    },
    methods: {
        setUpSocketEvents() {
            mo.socket.on('chat', (message) => {
                this.$store.commit('sendChat', [message]);
            });
        },
        scrollChat() {
            if (this.$refs.chatBody.scrollTop === this.$refs.chatBody.scrollHeight - this.$refs.chatBody.clientHeight) {
                this.$nextTick(() => {
                    this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
                });
            }

            if (this.$refs.chatBodyBattle.scrollTop === this.$refs.chatBodyBattle.scrollHeight - this.$refs.chatBodyBattle.clientHeight) {
                this.$nextTick(() => {
                    this.$refs.chatBodyBattle.scrollTop = this.$refs.chatBodyBattle.scrollHeight;
                });
            }
        }
    }
};
</script>