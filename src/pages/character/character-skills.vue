<template>
    <section class="character">
        <div class="character__tabs">
            <button class="btn btn-primary">1st job</button>
            <button class="btn btn-secondary"
                disabled
            >2nd job</button>
        </div>

        <div v-if="skillInfo.show"
            class="skill-info"
            @click="skillInfo.show = false"
        >
            <b>{{ skillInfo.name }}</b>
            <div v-if="skillInfo.requirements">Requirements: <b class="skill-info__requirement">{{ skillInfo.requirements }}</b></div>
            <div>Max Level: <b>{{ skillInfo.maxLevel }}</b></div>
            <span v-html="skillInfo.explanation" />
        </div>

        <div class="skills-list">
            <div v-for="skill in availableSkills"
                :key="skill.id"
                class="skills-list__skill"
            >
                <img :src="`/dist/assets/images/skills/${skill.image}`"
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

                <div :class="{'skills-list__incdec--disabled': (characterSkills[skill.id] || 0) === tempSkills[skill.id]}"
                    class="skills-list__incdec"
                    @click="decreaseTempSkill(skill)"
                >-</div>
                <div :class="{'skills-list__incdec--disabled': tempSkillPoints <= 0 || tempSkills[skill.id] >= skill.maxLevel || !skillRequirementMet(skill)}"
                    class="skills-list__incdec"
                    @click="increaseTempSkill(skill)"
                >+</div>
            </div>
        </div>

        <div class="skills-list__bottom">
            <div class="skills-list__points">
                <span class="skills-list__points__label">Skill points:</span>
                <span :class="{'skills-list__points__points--empty': tempSkillPoints === 0 }"
                    class="skills-list__points__points"
                >{{ tempSkillPoints }}</span>
            </div>

            <button :disabled="tempSkillPoints === characterSkillPoints"
                class="btn btn-primary skills-list__apply"
                @click="saveSkills()"
            >Save</button>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import allSkills from '../../../config/skills.json';

const characterSkillsPage = {
    data() {
        return {
            skillInfo: {
                show: false,
                name: '',
                maxLevel: 0,
                explanation: ''
            },
            availableSkills: [],
            tempSkills: [],
            tempSkillPoints: 0
        };
    },
    computed: {
        ...mapGetters(['characterSkillPoints', 'characterSkills', 'characterJobId'])
    },
    mounted() {
        this.$nextTick(() => {
            this.tempSkillPoints = this.characterSkillPoints;
            this.tempSkills = Object.assign({}, this.characterSkills);

            this.populateAvailableSkills();

            this.populateTempSkills();
        });
    },
    methods: {
        skillRequirementMet(skill) {
            for (const [key, value] of Object.entries(skill.requirements)) {
                // If skills is not found or lower level than required, return false
                if (!this.characterSkills || this.characterSkills[key] < value) {
                    return false;
                }
            }

            return true;
        },
        saveSkills() {
            this.$store.dispatch('saveSkills', {
                skills: Object.assign({}, this.tempSkills),
                skillPoints: this.tempSkillPoints
            });
        },
        populateAvailableSkills() {
            // Display skills that match jobId
            this.availableSkills = allSkills.filter((skill) => skill.jobs.includes(this.characterJobId));
        },
        populateTempSkills() {
            // Populating tempSkills array with availableSkills IDs/amounts to not have errors
            // Real skills will be dealth with separately
            for (let i = 0; i <= this.availableSkills.length; ++i) {
                if (!this.tempSkills[i]) {
                    this.tempSkills[i] = 0;
                }
            }
        },
        openSkillInfo(skill) {
            this.skillInfo.show = true;
            this.skillInfo.name = skill.name;
            this.skillInfo.maxLevel = skill.maxLevel;
            this.skillInfo.explanation = skill.explanation;
            this.skillInfo.requirements = '';

            // Transform object of requirements into readable text
            for (const [key, value] of Object.entries(skill.requirements)) {
                const foundSkill = this.availableSkills.find((skill) => skill.id === Number(key));

                this.skillInfo.requirements += `${foundSkill.name} (${value}), `;
            }

            // Stripping last 2 elements, in case it's even populated
            if (this.skillInfo.requirements) {
                this.skillInfo.requirements = this.skillInfo.requirements.substring(0, this.skillInfo.requirements.length - 2);
            }
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
            if (this.tempSkillPoints <= 0 || this.tempSkills[skill.id] >= skill.maxLevel || !this.skillRequirementMet(skill)) {
                return false;
            }

            this.tempSkillPoints--;

            this.tempSkills[skill.id]++;
        }
    }
};

// Routing
mo.routes.push({
    path: '/character/skills',
    component: characterSkillsPage
});

export default characterSkillsPage;
</script>