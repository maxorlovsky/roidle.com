<template>
    <div class="file-upload">
        <div class="drop-box">
            <input ref="file"
                :accept="inputAccept"
                :disabled="loading"
                name="file-upload"
                type="file"
                @change="filesChange($event.target.name, $event.target.files);"
            >

            <img v-if="!loading && isEmpty"
                :src="`${serverUrl}/dist/assets/images/items/672.gif`"
            >
            <img v-else-if="!loading && !isEmpty"
                :src="displayPicture"
            >
            <loading v-else-if="loading" />
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

export default {
    name: 'file-upload',
    components: {
        loading
    },
    props: {
        inputAccept: {
            type: String,
            default: ''
        },
        eventName: {
            type: String,
            default: ''
        },
        eventParams: {
            type: Object,
            default: () => ({})
        },
        isEmpty: {
            type: Boolean,
            default: true
        },
        displayPicture: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            loading: false,
            uploadedFiles: [],
            uploadError: null,
            // 2MB
            maxFileSize: 2000000
        };
    },
    computed: {
        ...mapGetters(['serverUrl']),

    },
    mounted() {
        this.reset();

        mo.socket.on(`${this.eventName}Complete`, (response) => {
            this.reset();

            if (response) {
                this.$emit('upload-complete', response);
            }
        });
    },
    beforeDestroy() {
        mo.socket.off(`${this.eventName}Complete`);
    },
    methods: {
        reset() {
            // Reset form to initial state
            this.loading = false;
        },
        save(base64, mimeType) {
            this.loading = true;

            mo.socket.emit(this.eventName, {
                ...this.eventParams,
                base64,
                mimeType
            });
        },
        filesChange(fieldName, fileList) {
            if (!fileList.length) {
                return;
            }

            // Checking file size
            if (fileList[0].size > this.maxFileSize) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: this.$t('shop.fileSizeTooLarge')
                    }
                ]);

                this.reset();

                return false;
            }

            // Generating file
            const fr = new FileReader();
            const image = new Image();

            fr.readAsDataURL(fileList[0]);

            // Waiting for it to load, to start loading it into image source, to check resolution
            fr.addEventListener('load', () => {
                image.src = fr.result;
            });

            // Waiting for image to load
            image.addEventListener('load', () => {
                // Check resolution
                if (image.width !== 50 && image.height !== 50) {
                    this.$store.commit('sendChat', [
                        {
                            type: 'system',
                            character: 'System',
                            message: this.$t('shop.fileResolutionIncorrect')
                        }
                    ]);

                    this.reset();

                    return false;
                }

                // Move to base64 string
                const base64 = fr.result;
                const mimeType = fileList[0].name.split('.').pop();

                // Save it
                this.save(base64, mimeType);
            });
        }
    }
};
</script>