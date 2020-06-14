<template>
    <section class="chat">
        <div class="chat-wrapper">
            <div class="chat__tabs">
                <div v-for="(chat, index) in chats"
                    :key="chat"
                    :class="{'chat__tabs__tab--selected': selectedTab === index, 'chat__tabs__tab--notification': tabNotification[index]}"
                    class="chat__tabs__tab"
                    @click="selectedTab = index; tabNotification[index] = false; scrollChat()"
                >{{ chat }} chat</div>
            </div>

            <div v-show="selectedTab === 0"
                ref="chatBody-regular"
                class="chat__body"
            >
                <p v-for="(chat, index) in chatLog.regular"
                    :key="index"
                    :class="[`chat__body__${chat.type}`, { 'chat__body__self': chat.self }]"
                >[ #{{ chat.type }} ] <span @click="openProfile(chat.character)">{{ chat.character }}</span>: {{ chat.message }}</p>
            </div>
            <div v-show="selectedTab === 1"
                ref="chatBody-system"
                class="chat__body"
            >
                <p v-for="(chat, index) in chatLog.system"
                    :key="index"
                >{{ chat.message }}</p>
            </div>
            <div v-show="selectedTab === 2"
                ref="chatBody-battle"
                class="chat__body"
            >
                <p v-for="(chat, index) in chatLog.battle"
                    :key="index"
                >{{ chat.message }}</p>
            </div>
            <div class="chat__input">
                <input v-model="whisperName"
                    type="text"
                    class="chat__input__whisper"
                    @keyup.enter="sendChat()"
                >
                <input v-model="message"
                    type="text"
                    class="chat__input__message"
                    @keyup.enter="sendChat()"
                >
                <button class="btn game-button btn-sm chat__input__button"
                    @click="sendChat()"
                >&#62;</button>

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
            whisperName: '#global',
            message: '',
            chats: ['Regular', 'System', 'Battle'],
            chatLog: {
                regular: [],
                system: [],
                battle: []
            },
            disabledChat: true,
            selectedTab: 0,
            tabNotification: [false, false, false]
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'chatContent',
            'socketConnection',
            'resetChat',
            'characterName'
        ])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        resetChat() {
            this.chatLog.regular = [];
            this.chatLog.system = [];
            this.chatLog.battle = [];
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
                    if (this.selectedTab !== 2) {
                        this.tabNotification[2] = true;
                    }

                    this.chatLog.battle.push({
                        message: chat.message
                    });
                } else if (chat.type === 'system') {
                    if (this.selectedTab !== 1) {
                        this.tabNotification[1] = true;
                    }

                    this.chatLog.system.push({
                        message: chat.message
                    });
                } else {
                    if (this.selectedTab !== 0) {
                        this.tabNotification[0] = true;
                    }

                    this.chatLog.regular.push({
                        type: chat.type,
                        character: chat.character,
                        message: chat.message,
                        self: this.characterName === chat.character
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
        openProfile(name) {
            if (name !== 'Map' && name !== 'System') {
                this.$router.push(`/profile/${name}`);
            }
        },
        setUpSocketEvents() {
            mo.socket.on('chat', (message) => {
                this.$store.commit('sendChat', [message]);
            });
        },
        scrollChat() {
            for (const chat of this.chats) {
                const chatBody = `chatBody-${chat.toLowerCase()}`;

                if (this.$refs[chatBody].scrollTop >= this.$refs[chatBody].scrollHeight - this.$refs[chatBody].clientHeight - 2) {
                    this.$nextTick(() => {
                        this.$refs[chatBody].scrollTop = this.$refs[chatBody].scrollHeight;
                    });
                }
            }
        },
        sendChat() {
            if (!this.message.trim()) {
                return false;
            }

            mo.socket.emit('sendChatMessage', {
                to: this.whisperName,
                message: this.message
            });

            this.message = '';
        }
    }
};
</script>