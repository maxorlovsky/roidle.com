<template>
    <section :class="{ 'chat--toggled': !showChat }"
        class="chat"
    >
        <div class="chat-wrapper">
            <div class="chat__tabs">
                <div v-for="(chat, index) in chats"
                    :key="chat"
                    :class="{'chat__tabs__tab--selected': selectedTab === index, 'chat__tabs__tab--notification': tabNotification[index]}"
                    class="chat__tabs__tab"
                    @click="selectedTab = index; tabNotification[index] = false; scrollChat()"
                >{{ chat }} chat</div>

                <div :class="{ 'chat__tabs__tab__toggle--toggled': !showChat }"
                    class="chat__tabs__tab chat__tabs__tab__toggle"
                    @click="toggleChat()"
                ><i class="icon icon-arrow-down" /></div>
            </div>

            <div v-show="selectedTab === 0"
                ref="chatBody-regular"
                class="chat__body"
            >
                <p v-for="(chat, index) in chatLog.regular"
                    :key="index"
                    :class="[`chat__body__${chat.type}`, { 'chat__body__self': chat.self }]"
                >
                    <span v-if="chat.type === 'private'"
                        class="chat__body__chat--type--message"
                        @click="sendPrivateMessage(`${chat.character}`)"
                    >[ #private ] <span v-if="chat.to">To</span><span v-else>From</span> </span>
                    <span v-else
                        class="chat__body__chat--type--message"
                        @click="sendPrivateMessage(`#${chat.type}`)"
                    >[ #{{ chat.type }} ]</span>
                    <span @click="openModal(chat.character)">{{ chat.character }}</span>:
                    <span class="chat__body__message"
                        v-html="chat.message"
                    />
                </p>
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
                    v-html="chat.message"
                />
            </div>
            <div class="chat__input">
                <input v-model="whisperName"
                    type="text"
                    class="chat__input__whisper"
                    maxlength="100"
                    @keyup.enter="sendChat()"
                >
                <input v-model="message"
                    type="text"
                    class="chat__input__message"
                    maxlength="150"
                    @keyup.enter="sendChat()"
                >
                <button class="btn game-button btn-sm chat__input__button"
                    @click="sendChat()"
                >&#62;</button>

                <div v-if="disabledChat"
                    class="chat__input__limit"
                >Need Basic Level 1 to use chat</div>
            </div>

            <div v-if="showChatModal"
                class="modal chat__modal"
            >
                <div class="modal__header">{{ modalCharacterName }}</div>
                <div class="modal__content chat__modal__buttons">
                    <button class="btn game-button"
                        @click="openProfile(modalCharacterName)"
                    >View profile</button>
                    <button class="btn game-button"
                        @click="sendPrivateMessage(modalCharacterName)"
                    >Message</button>
                    <button v-if="admin"
                        class="btn btn-warning"
                        @click="mute(modalCharacterName)"
                    >Mute</button>
                    <button v-if="admin"
                        class="btn btn-danger"
                        @click="ban(modalCharacterName)"
                    >Ban</button>
                </div>
                <div class="modal__buttons">
                    <button class="btn btn-secondary"
                        @click="showChatModal = false"
                    >Cancel</button>
                </div>
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
            tabNotification: [false, false, false],
            showChatModal: false,
            modalCharacterName: ''
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'chatContent',
            'socketConnection',
            'resetChat',
            'characterName',
            'showChat',
            'admin'
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

                    // Update name variable with character name
                    chat.message = chat.message.replace(/{name}/g, this.characterName)
                        .replace(/(&skill;)/g, '<span class="chat__input__message--skill">')
                        .replace(/(&endskill;)/g, '</span>')
                        .replace(/(&bold;)/g, '<span class="chat__input__message--bold">')
                        .replace(/(&endbold;)/g, '</span>')
                        .replace(/(\n)/g, '<br>');

                    // Check if chat is becoming too large and cleaning up first properties to not consume so much memory
                    // For battle chat we try to log a lot of stuff, so holding up to 1000 lines
                    if (this.chatLog.battle.length > 1000) {
                        this.chatLog.battle.shift();
                    }

                    this.chatLog.battle.push({
                        message: chat.message
                    });
                } else if (chat.type === 'system') {
                    if (this.selectedTab !== 1) {
                        this.tabNotification[1] = true;
                    }

                    // Check if chat is becoming too large and cleaning up first properties to not consume so much memory
                    // For system chat we try to preserve stuff for when user is afk, so holding up to 300 lines
                    if (this.chatLog.system.length > 300) {
                        this.chatLog.system.shift();
                    }

                    this.chatLog.system.push({
                        message: chat.message
                    });
                } else {
                    if (this.selectedTab !== 0) {
                        this.tabNotification[0] = true;
                    }

                    // Add emotes recognition, because of nature of regex, we need to loop through it two times, otherwise some text might go through
                    chat.message = this.addEmotes(chat.message);
                    chat.message = this.addEmotes(chat.message);

                    // Check if chat is becoming too large and cleaning up first properties to not consume so much memory
                    if (this.chatLog.regular.length > 100) {
                        this.chatLog.regular.shift();
                    }

                    this.chatLog.regular.push({
                        type: chat.type,
                        to: chat.to ? chat.to : null,
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
        ban(name) {
            if (!this.admin) {
                return false;
            }

            console.warn(`Ban: ${name}`);
        },
        mute(name) {
            if (!this.admin) {
                return false;
            }

            console.warn(`Mute: ${name}`);
        },
        openModal(characterName) {
            this.modalCharacterName = characterName;
            this.showChatModal = true;
        },
        addEmotes(message) {
            message = message.replace(/(?:^|\W)\/bawi(?:$|\W)/g, ' <img src="/dist/assets/images/emote/bawi.png"> ')
                .replace(/(?:^|\W)\/bo(?:$|\W)/g, ' <img src="/dist/assets/images/emote/bo.png"> ')
                .replace(/(?:^|\W)\/gawi(?:$|\W)/g, '<img src="/dist/assets/images/emote/gawi.png"> ')
                .replace(/(?:^|\W)\/!(?:$|\W)/g, ' <img src="/dist/assets/images/emote/exc.gif"> ')
                .replace(/(?:^|\W)\/\?(?:$|\W)/g, ' <img src="/dist/assets/images/emote/que.gif"> ')
                .replace(/(?:^|\W)\/ho(?:$|\W)/g, ' <img src="/dist/assets/images/emote/ho.gif"> ')
                .replace(/(?:^|\W)\/lv(?:$|\W)/g, ' <img src="/dist/assets/images/emote/lv.gif"> ')
                .replace(/(?:^|\W)\/lv2(?:$|\W)/g, ' <img src="/dist/assets/images/emote/lv2.gif"> ')
                .replace(/(?:^|\W)\/swt(?:$|\W)/g, ' <img src="/dist/assets/images/emote/swt.gif"> ')
                .replace(/(?:^|\W)\/ic(?:$|\W)/g, ' <img src="/dist/assets/images/emote/ic.gif"> ')
                .replace(/(?:^|\W)\/an(?:$|\W)/g, ' <img src="/dist/assets/images/emote/an.gif"> ')
                .replace(/(?:^|\W)\/ag(?:$|\W)/g, ' <img src="/dist/assets/images/emote/an2.gif"> ')
                .replace(/(?:^|\W)\/\$(?:$|\W)/g, ' <img src="/dist/assets/images/emote/mon.gif"> ')
                .replace(/(?:^|\W)\/\.\.\.(?:$|\W)/g, ' <img src="/dist/assets/images/emote/dots.gif"> ')
                .replace(/(?:^|\W)\/thx(?:$|\W)/g, ' <img src="/dist/assets/images/emote/thx.gif"> ')
                .replace(/(?:^|\W)\/heh(?:$|\W)/g, ' <img src="/dist/assets/images/emote/heh.gif"> ')
                .replace(/(?:^|\W)\/hmm(?:$|\W)/g, ' <img src="/dist/assets/images/emote/hmm.gif"> ')
                .replace(/(?:^|\W)\/no1(?:$|\W)/g, ' <img src="/dist/assets/images/emote/nic1.gif"> ')
                .replace(/(?:^|\W)\/ok(?:$|\W)/g, ' <img src="/dist/assets/images/emote/ok.gif"> ')
                .replace(/(?:^|\W)\/go(?:$|\W)/g, ' <img src="/dist/assets/images/emote/go.gif"> ')
                .replace(/(?:^|\W)\/gg(?:$|\W)/g, ' <img src="/dist/assets/images/emote/gg.gif"> ')
                .replace(/(?:^|\W)\/kis(?:$|\W)/g, ' <img src="/dist/assets/images/emote/kis.gif"> ')
                .replace(/(?:^|\W)\/kis2(?:$|\W)/g, ' <img src="/dist/assets/images/emote/kis2.gif"> ')
                .replace(/(?:^|\W)\/pif(?:$|\W)/g, ' <img src="/dist/assets/images/emote/pif.gif"> ')
                .replace(/(?:^|\W)\/\?\?(?:$|\W)/g, ' <img src="/dist/assets/images/emote/que2.gif"> ')
                .replace(/(?:^|\W)\/bzz(?:$|\W)/g, ' <img src="/dist/assets/images/emote/bzz.gif"> ')
                .replace(/(?:^|\W)\/e1(?:$|\W)/g, ' <img src="/dist/assets/images/emote/bzz.gif"> ')
                .replace(/(?:^|\W)\/rice(?:$|\W)/g, ' <img src="/dist/assets/images/emote/rice.gif"> ')
                .replace(/(?:^|\W)\/e2(?:$|\W)/g, ' <img src="/dist/assets/images/emote/rice.gif"> ')
                .replace(/(?:^|\W)\/awsm(?:$|\W)/g, ' <img src="/dist/assets/images/emote/awsm.gif"> ')
                .replace(/(?:^|\W)\/e3(?:$|\W)/g, ' <img src="/dist/assets/images/emote/awsm.gif"> ')
                .replace(/(?:^|\W)\/meh(?:$|\W)/g, ' <img src="/dist/assets/images/emote/meh.gif"> ')
                .replace(/(?:^|\W)\/e4(?:$|\W)/g, ' <img src="/dist/assets/images/emote/meh.gif"> ')
                .replace(/(?:^|\W)\/shy(?:$|\W)/g, ' <img src="/dist/assets/images/emote/shy.gif"> ')
                .replace(/(?:^|\W)\/e5(?:$|\W)/g, ' <img src="/dist/assets/images/emote/shy.gif"> ')
                .replace(/(?:^|\W)\/slur(?:$|\W)/g, ' <img src="/dist/assets/images/emote/slur.gif"> ')
                .replace(/(?:^|\W)\/e8(?:$|\W)/g, ' <img src="/dist/assets/images/emote/slur.gif"> ')
                .replace(/(?:^|\W)\/yawn(?:$|\W)/g, ' <img src="/dist/assets/images/emote/yawn.gif"> ')
                .replace(/(?:^|\W)\/e10(?:$|\W)/g, ' <img src="/dist/assets/images/emote/yawn.gif"> ')
                .replace(/(?:^|\W)\/dice(?:$|\W)/g, ' <img src="/dist/assets/images/emote/dice.gif"> ')
                .replace(/(?:^|\W)\/e19(?:$|\W)/g, ' <img src="/dist/assets/images/emote/dice.gif"> ')
                .replace(/(?:^|\W)\/hum(?:$|\W)/g, ' <img src="/dist/assets/images/emote/hum.gif"> ')
                .replace(/(?:^|\W)\/e27(?:$|\W)/g, ' <img src="/dist/assets/images/emote/hum.gif"> ')
                .replace(/(?:^|\W)\/oops(?:$|\W)/g, ' <img src="/dist/assets/images/emote/oops.gif"> ')
                .replace(/(?:^|\W)\/e29(?:$|\W)/g, ' <img src="/dist/assets/images/emote/oops.gif"> ')
                .replace(/(?:^|\W)\/spit(?:$|\W)/g, ' <img src="/dist/assets/images/emote/spit.gif"> ')
                .replace(/(?:^|\W)\/e30(?:$|\W)/g, ' <img src="/dist/assets/images/emote/spit.gif"> ')
                .replace(/(?:^|\W)\/panic(?:$|\W)/g, ' <img src="/dist/assets/images/emote/panic.gif"> ')
                .replace(/(?:^|\W)\/e32(?:$|\W)/g, ' <img src="/dist/assets/images/emote/panic.gif"> ')
                .replace(/(?:^|\W)\/whisp(?:$|\W)/g, ' <img src="/dist/assets/images/emote/whisp.gif"> ')
                .replace(/(?:^|\W)\/e33(?:$|\W)/g, ' <img src="/dist/assets/images/emote/whisp.gif"> ');

            return message;
        },
        toggleChat() {
            this.$store.commit('showChat', !this.showChat);
        },
        openProfile(name) {
            this.showChatModal = false;

            if (name !== 'Map' && name !== 'System') {
                this.$router.push(`/profile/${name}`);
            }
        },
        sendPrivateMessage(name) {
            this.showChatModal = false;
            this.whisperName = name;
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