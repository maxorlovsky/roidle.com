<template>
    <section :class="{ 'chat--toggled': !showChat, 'chat--expanded': fullChat }"
        class="chat"
    >
        <div class="chat-wrapper">
            <div class="chat__tabs">
                <div v-for="(chat, index) in chats"
                    :key="chat"
                    :class="{'chat__tabs__tab--selected': selectedTab === index, 'chat__tabs__tab--notification': tabNotification[index]}"
                    class="chat__tabs__tab"
                    @click="selectChatTab(index)"
                >{{ chat }} {{ $t('chat.chat') }}</div>

                <div :class="{ 'chat__tabs__tab__expand--expanded': fullChat }"
                    class="chat__tabs__tab chat__tabs__tab__expand"
                    @click="expandChat()"
                >
                    <i class="icon icon-arrow-down" />
                    <i class="icon icon--second icon-arrow-down" />
                </div>
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
                    <span v-if="chat.timestamp"
                        class="chat__body__chat__timestamp"
                    >({{ chat.timestamp }})</span>

                    <span v-if="chat.type === 'private'"
                        class="chat__body__chat--type--message"
                        @click="sendPrivateMessage(`${chat.character}`)"
                    >[ #private ] <span v-if="chat.to">To</span><span v-else>{{ $t('chat.from') }}</span> </span>
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
                    v-html="chat.message"
                />
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
                    @keyup.up="cicleMessageUp()"
                    @keyup.down="cicleMessageDown()"
                >
                <button class="btn game-button btn-sm chat__input__emoticons"
                    @click="toggleEmoticons()"
                >
                    <i class="icon icon-emoticon" />
                </button>
                <button class="btn game-button btn-sm chat__input__button"
                    @click="sendChat()"
                >&#62;</button>

                <div v-if="disabledChat"
                    class="chat__input__limit"
                >{{ $t('chat.needBasicLevel', {
                    level: 3
                }) }}</div>
            </div>

            <div v-if="showChatModal"
                class="modal chat__modal"
            >
                <div class="modal__header">{{ modalCharacterName }}</div>
                <div class="modal__content chat__modal__buttons">
                    <button class="btn game-button"
                        @click="openProfile(modalCharacterName)"
                    >{{ $t('global.viewProfile') }}</button>
                    <button class="btn game-button"
                        @click="sendPrivateMessage(modalCharacterName)"
                    >{{ $t('chat.message') }}</button>
                    <button class="btn game-button"
                        @click="trade(modalCharacterName)"
                    >{{ $t('global.trade') }}</button>
                    <button v-if="admin || moderator"
                        class="btn btn-warning"
                        @click="mute(modalCharacterName)"
                    >{{ $t('global.mute') }}</button>
                    <button v-if="admin"
                        class="btn btn-danger"
                        @click="ban(modalCharacterName)"
                    >{{ $t('global.ban') }}</button>
                </div>
                <div class="modal__buttons">
                    <button class="btn btn-secondary"
                        @click="showChatModal = false"
                    >{{ $t('global.cancel') }}</button>
                </div>
            </div>
        </div>

        <div :class="{'chat__system-message--shown': showSystemMessage}"
            class="chat__system-message"
            @click="stopSystemPopup()"
            v-html="systemMessage"
        />

        <div v-if="showEmoticons"
            class="modal chat__modal chat__emoticons"
        >
            <img v-for="emoticon in emoticons"
                :key="emoticon"
                :src="`${serverUrl}/dist/assets/images/emote/${emoticon}.gif`"
                @click="addEmoticon(emoticon)"
            >
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';
import { format as dateFormat } from 'date-fns';

// Utilities
import { functions } from '@utils/functions.js';
import { addEmotes } from '@utils/chat.js';

// Check if in chat we need to paste skill or item
const chatRegex = new RegExp(/\[Skill:[\w /-]+\]|\[Item:[\w\s]+\]/g);

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
            modalCharacterName: '',
            fullChat: false,
            showSystemMessage: false,
            systemMessage: '',
            systemMessageTimeout: null,
            chatMemory: [],
            memoryNumber: 0,
            showEmoticons: false,
            emoticons: ['bawi', 'bo', 'gawi', 'exc', 'que', 'ho', 'lv', 'swt', 'ic', 'an', 'ag', 'mon', 'dots', 'thx', 'heh', 'hmm', 'no1', 'ok', 'go', 'gg', 'kis', 'kis2', 'pif', 'que2', 'bzz', 'rice', 'awsm', 'meh', 'shy', 'slur', 'yawn', 'dice', 'hum', 'oops', 'spit', 'panic', 'whisp'],
            emoticonsAdditions: []
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'chatContent',
            'socketConnection',
            'characterName',
            'showChat',
            'serverUrl',
            'admin',
            'moderator',
            'allSkillsNames',
            'allItemsNames',
            'putIntoChat'
        ])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            } else {
                this.destroySocketEvents();
            }
        },
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[1] >= 3) {
                    this.disabledChat = false;
                } else {
                    this.disabledChat = true;
                }
            }
        },
        chatContent() {
            for (const chat of this.chatContent) {
                if (chat.type === 'battle') {
                    if (this.selectedTab !== 2) {
                        this.tabNotification[2] = true;
                    }

                    chat.message = this.stylizeChat(chat.message);

                    // Check if chat is becoming too large and cleaning up first properties to not consume so much memory
                    // For battle chat we try to log a lot of stuff, so holding up to 500 lines
                    if (this.chatLog.battle.length > 500) {
                        this.chatLog.battle.shift();
                    }

                    this.chatLog.battle.push({
                        message: chat.message
                    });
                } else if (chat.type === 'system') {
                    // In case system message pop up is still showin, we're hiding it
                    if (this.systemMessageTimeout) {
                        this.stopSystemPopup();
                    }

                    chat.message = this.stylizeChat(chat.message);

                    // In case we receive an important flag, we need to show chat window and switch to system tab
                    if (chat.important) {
                        this.selectedTab = 1;
                        this.$store.commit('showChat', true);
                        this.tabNotification[1] = false;
                    } else if (this.selectedTab !== 1) {
                        this.tabNotification[1] = true;
                    }

                    // If system message is not marked as important, but chat is closed we show it as a popup
                    if (!chat.important && !this.showChat) {
                        this.showSystemMessage = true;
                        this.systemMessage = chat.message;

                        this.systemMessageTimeout = setTimeout(() => {
                            this.showSystemMessage = false;
                            this.systemMessage = '';
                        }, 3000);
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
                    chat.message = addEmotes(chat.message);
                    chat.message = addEmotes(chat.message);

                    chat.message = this.addSkillInfoCheck(chat.message);

                    // Check if chat is becoming too large and cleaning up first properties to not consume so much memory
                    if (this.chatLog.regular.length > 100) {
                        this.chatLog.regular.shift();
                    }

                    this.chatLog.regular.push({
                        type: chat.type,
                        to: chat.to ? chat.to : null,
                        character: chat.character,
                        message: chat.message,
                        timestamp: chat.timestamp ? dateFormat(new Date(chat.timestamp), 'dd MMM HH:mm:ss') : null,
                        self: this.characterName === chat.character
                    });
                }
            }

            this.scrollChat();
        },
        showChat() {
            // In case chat need to be hidden completely, we need to remove full chat variable
            if (!this.showChat) {
                this.fullChat = false;
            }
        },
        putIntoChat() {
            if (this.message) {
                this.message += ` ${this.putIntoChat}`;
            } else {
                this.message = this.putIntoChat;
            }
        }
    },
    mounted() {
        if (functions.storage('get', 'hideChat')) {
            this.$store.commit('showChat', false);
        }
    },
    methods: {
        stylizeChat(message) {
            // Update name variable with character name
            return message.replace(/{name}/g, this.characterName)
                .replace(/(&skill;)/g, '<span class="chat__input__message--skill">')
                .replace(/(&endskill;)/g, '</span>')
                .replace(/(&bold;)/g, '<span class="chat__input__message--bold">')
                .replace(/(&endbold;)/g, '</span>')
                .replace(/(\n)/g, '<br>');
        },
        closeEmoticons() {
            this.showEmoticons = false;
        },
        addEmoticon(emoticon) {
            this.message += ` /${emoticon}`;

            this.closeEmoticons();
        },
        toggleEmoticons() {
            this.showEmoticons = !this.showEmoticons;
        },
        stopSystemPopup() {
            clearTimeout(this.systemMessageTimeout);
            this.showSystemMessage = false;
            this.systemMessage = '';
        },
        ban(name) {
            if (!this.admin) {
                return false;
            }

            mo.socket.emit('adminBanPlayer', name);
        },
        mute(name) {
            if (!this.admin && !this.moderator) {
                return false;
            }

            mo.socket.emit('adminMutePlayer', name);
        },
        trade(characterName) {
            mo.socket.emit('initiateTrading', characterName);
            this.showChatModal = false;
        },
        openModal(characterName) {
            if (['map', 'system', 'party', 'admin', 'kafra'].includes(characterName.toLowerCase())) {
                return false;
            }

            if (characterName.toLowerCase() === this.characterName.toLowerCase()) {
                return false;
            }


            this.modalCharacterName = characterName;
            this.showChatModal = true;
        },
        addSkillInfoCheck(message) {
            let match = null;

            while ((match = chatRegex.exec(message))) {
                // Removing [ and ] symbols
                const stripResult = match[0].substr(1, match[0].length - 2);
                // Striping by : as this is the only thing that should remain
                const splitResult = stripResult.split(':');

                // Define if it's a skill
                if (splitResult[0] === 'Skill' && this.allSkillsNames.includes(splitResult[1])) {
                    message = message.replace(match, ` <a href="javascript:;" class="chat__skill" onClick="mo.socket.emit('getSkillInfoByName', '${splitResult[1]}')">[${splitResult[1]}]</a> `);
                } else if (splitResult[0] === 'Item' && this.allItemsNames.includes(splitResult[1])) {
                    message = message.replace(match, ` <a href="javascript:;" class="chat__item" onClick="mo.socket.emit('getItemInfoByName', '${splitResult[1]}')">[${splitResult[1]}]</a> `);
                }
            }

            return message;
        },
        selectChatTab(index) {
            if (!this.showChat) {
                this.fullChat = true;

                this.expandChat();
            }

            this.selectedTab = index;
            this.tabNotification[index] = false;
            this.scrollChat();
        },
        expandChat() {
            this.fullChat = !this.fullChat;
            this.$store.commit('showChat', true);
            functions.storage('remove', 'hideChat');
        },
        toggleChat() {
            this.$store.commit('showChat', !this.showChat);

            // Save state of the chat in local storage
            if (this.showChat) {
                functions.storage('remove', 'hideChat');
            } else {
                functions.storage('set', 'hideChat', true);
            }
        },
        openProfile(name) {
            this.showChatModal = false;

            this.$router.push(`/profile/${name}`);
        },
        sendPrivateMessage(name) {
            this.showChatModal = false;
            this.whisperName = name;
        },
        setUpSocketEvents() {
            mo.socket.on('chat', (message) => {
                this.$store.commit('sendChat', [message]);
            });

            mo.socket.on('adminMutePlayerComplete', () => {
                this.showChatModal = false;
            });

            mo.socket.on('adminBanPlayerComplete', () => {
                this.showChatModal = false;
            });
        },
        destroySocketEvents() {
            if (mo.socket) {
                mo.socket.off('chat');
                mo.socket.off('adminMutePlayerComplete');
                mo.socket.off('adminBanPlayerComplete');
            }
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
        cicleMessageUp() {
            if (this.memoryNumber <= 0) {
                return false;
            }

            this.memoryNumber--;
            this.message = this.chatMemory[this.memoryNumber];
        },
        cicleMessageDown() {
            if (this.memoryNumber >= this.chatMemory.length) {
                return false;
            }

            this.memoryNumber++;
            this.message = this.chatMemory[this.memoryNumber];
        },
        sendChat() {
            if (!this.message.trim()) {
                return false;
            }

            this.closeEmoticons();

            mo.socket.emit('sendChatMessage', {
                to: this.whisperName,
                message: this.message
            });

            this.memoryNumber++;
            this.chatMemory.push(this.message);

            this.message = '';
        }
    }
};
</script>