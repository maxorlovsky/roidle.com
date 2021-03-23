<template>
    <div class="skills-list">
        <div class="skills-list__wrapper">
            <div v-for="skill in availableSkills"
                :key="skill.id"
                class="skills-list__skill"
            >
                <img :src="`${serverUrl}/dist/assets/images/skills/${skill.id}.gif`"
                    :class="{'skills-list__skill__image--disabled': tempSkills[skill.id] === 0}"
                    class="skills-list__skill__image"
                    @click="openSkillInfo(skill)"
                >

                <div class="skills-list__skill__info"
                    @click="openSkillInfo(skill)"
                >
                    <div>{{ skill.name }}</div>
                    <div>Lv: {{ tempSkills[skill.id] }} / {{ skill.maxLevel }}</div>
                </div>

                <template v-if="skillRequirementMet(skill)">
                    <div :class="{'skills-list__incdec--disabled': (characterSkills[skill.id] || 0) === tempSkills[skill.id]}"
                        class="skills-list__incdec"
                        @click="decreaseTempSkill(skill)"
                    >-</div>
                    <div :class="{'skills-list__incdec--disabled': tempSkillPoints <= 0 || tempSkills[skill.id] >= skill.maxLevel}"
                        class="skills-list__incdec"
                        @click="increaseTempSkill(skill)"
                    >+</div>
                </template>
            </div>
        </div>

        <div class="skills-list__bottom">
            <div class="skills-list__points">
                <span class="skills-list__points__label">{{ $t('character.skillPoints') }}:</span>
                <span :class="{'skills-list__points__points--empty': tempSkillPoints === 0 }"
                    class="skills-list__points__points"
                >{{ tempSkillPoints }}</span>
            </div>

            <button :disabled="tempSkillPoints === characterSkillPoints"
                class="btn game-button skills-list__apply"
                @click="saveSkills()"
            >{{ $t('global.save') }}</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'skills-list',
    data() {
        return {
            availableSkills: [],
            tempSkills: {},
            tempSkillPoints: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterSkillPoints',
            'characterSkills',
            'characterJobId',
            'serverUrl'
        ]),
    },
    mounted() {
        mo.socket.on('saveSkillsComplete', (response) => {
            this.$store.commit('saveSkills', response);

            // Trigger recalculations of stats
            mo.socket.emit('characterStatsRecalculation');
        });

        mo.socket.on('getSkillsDataComplete', (response) => {
            this.availableSkills = response;

            this.populateTempSkills();

            this.tempSkillPoints = this.characterSkillPoints;
            this.tempSkills = Object.assign(this.tempSkills, this.characterSkills);
        });

        mo.socket.emit('getSkillsData');
    },
    beforeDestroy() {
        mo.socket.off('saveSkillsComplete');
        mo.socket.off('getSkillsDataComplete');
    },
    methods: {
        skillRequirementMet(skill) {
            // Check if user is under, so he need to spend 9 skills in Basic Skill
            if (skill.id !== 1 && (!this.characterSkills[1] || this.characterSkills[1] < 9)) {
                return false;
            }

            // In case there are no requirements, everything is cool
            if (!skill.requirements) {
                return true;
            }

            for (const [key, value] of Object.entries(skill.requirements)) {
                // If skills is not found or lower level than required, return false
                if (!this.characterSkills || !this.characterSkills[key] || this.characterSkills[key] < value) {
                    return false;
                }
            }

            return true;
        },
        saveSkills() {
            mo.socket.emit('saveSkills', {
                skills: Object.assign({}, this.tempSkills),
                skillPoints: this.tempSkillPoints
            });
        },
        populateTempSkills() {
            // Populating tempSkills array with availableSkills IDs/amounts to not have errors
            // Real skills will be dealth with separately
            for (const skill of Object.keys(this.availableSkills)) {
                this.tempSkills[this.availableSkills[skill].id] = 0;
            }
        },
        openSkillInfo(skill) {
            mo.socket.emit('getSkillInfo', skill.id);
        },
        decreaseTempSkill(skill) {
            // If skill wasn't tempered with, we do not allow to decrease it
            if ((this.characterSkills[skill.id] || 0) === this.tempSkills[skill.id]) {
                return false;
            }

            this.tempSkillPoints++;

            this.tempSkills[skill.id]--;
        },
        increaseTempSkill(skill) {
            // Check if player have skill points and that skill is not already maximum
            if (this.tempSkillPoints <= 0 || this.tempSkills[skill.id] >= skill.maxLevel) {
                return false;
            }

            this.tempSkillPoints--;

            this.tempSkills[skill.id]++;
        }
    }
};
</script>