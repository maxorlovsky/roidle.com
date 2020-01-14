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
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'chat',
    data() {
        return {
            whisperName: '',
            message: ''
        };
    },
    mounted() {
        this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
    }
};
</script>