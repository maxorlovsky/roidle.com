<template>
    <div v-if="show"
        class="skill-info"
        @click="closeSkillInfoModal()"
    >
        <img :src="`${serverUrl}/dist/assets/images/skills/${id}.gif`">
        <b>{{ name }}</b>
        <div v-if="requirements">{{ $t('character.requirements') }}: <b class="skill-info__requirement">{{ requirements }}</b></div>
        <div>{{ $t('character.maxLevel') }}: <b>{{ maxLevel }}</b></div>
        <div v-if="mp">{{ $t('character.manaCost') }}: <b>{{ mp }}</b></div>
        <span v-html="explanation" />
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'skill-info',
    data() {
        return {
            show: false,
            id: 0,
            name: '',
            requirements: '',
            maxLevel: 0,
            mp: null,
            explanation: ''
        };
    },
    computed: {
        ...mapGetters([
            'socketConnection',
            'closeSkillInfo',
            'serverUrl'
        ]),
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        closeSkillInfo() {
            this.closeSkillInfoModal();
        }
    },
    beforeDestroy() {
        mo.socket.off('getSkillInfoComplete');
    },
    methods: {
        setUpSocketEvents() {
            mo.socket.on('getSkillInfoComplete', (item) => {
                this.showSkillInfo(item);
            });
        },
        showSkillInfo(skill) {
            this.show = true;
            this.id = skill.id;
            this.name = skill.name;
            this.maxLevel = skill.maxLevel;
            this.explanation = skill.explanation;
            this.mp = '';
            this.requirements = '';

            if (skill.mp && Array.isArray(skill.mp)) {
                this.mp = `[${skill.mp.join(', ')}]`;
            } else if (skill.mp) {
                this.mp = skill.mp;
            }

            if (skill.requirementsString) {
                this.requirements = skill.requirementsString;
            }
        },
        closeSkillInfoModal() {
            this.show = false;
        }
    }
};
</script>