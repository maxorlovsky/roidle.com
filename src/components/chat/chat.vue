<template>
    <section class="chat">
        <div class="chat-wrapper">
            <div ref="chatBody"
                class="chat__body"
            >
                <p class="chat__body__main">[ #main ] Testa : rawr</p>
                <p class="chat__body__map">[ #map ] Testa : rawr</p>
                <p class="chat__body__main">[ #main ] Testa : rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr </p>
                <p class="chat__body__main">[ #main ] Testa : rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr </p>
                <p class="chat__body__main">[ #main ] Max : rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr </p>
                <p class="chat__body__main">[ #main ] Testa : rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr </p>
                <p class="chat__body__main">[ #main ] Testa : rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr </p>
                <p class="chat__body__main">[ #main ] Max : rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr </p>
                <p class="chat__body__main">[ #main ] Max : rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr rawr </p>
                <p class="chat__body__map">[ #map ] Max : rawr</p>
                <p class="chat__body__map">[ #map ] Max : rawr</p>
                <p class="chat__body__map">[ #map ] Testa : rawr</p>
                <p class="chat__body__map">[ #map ] Testa : rawr</p>
                <p class="chat__body__map">[ #map ] Testa : rawr</p>
                <p class="chat__body__map">[ #map ] Max : rawr</p>
                <p class="chat__body__map">[ #map ] Max : rawr</p>
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
            disabledChat: true
        };
    },
    computed: {
        ...mapGetters(['characterSkills'])
    },
    watch: {
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[1] >= 1) {
                    this.disabledChat = false;
                }
            }
        }
    },
    mounted() {
        this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
    }
};
</script>