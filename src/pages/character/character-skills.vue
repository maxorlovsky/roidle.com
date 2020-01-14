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
            <div>Max Level: <b>{{ skillInfo.maxLevel }}</b></div>
            <span v-html="skillInfo.explanation" />
        </div>

        <div class="skills-list">
            <div v-for="skill in availableSkills"
                :key="skill.id"
                class="skills-list__skill"
            >
                <img :src="`/dist/assets/images/skills/${skill.image}`"
                    :class="{'skills-list__skill__image--disabled': tempCharacterSkills[skill.id] === 0}"
                    class="skills-list__skill__image"
                    @click="openSkillInfo(skill)"
                >

                <div class="skills-list__skill__info"
                    @click="openSkillInfo(skill)"
                >
                    <div>{{ skill.name }}</div>
                    <div>Lv: {{ tempCharacterSkills[skill.id] }} / {{ skill.maxLevel }}</div>
                </div>

                <div :class="{'skills-list__incdec--disabled': characterSkills[skill.id] === tempCharacterSkills[skill.id]}"
                    class="skills-list__incdec"
                    @click="decreaseTempSkill(skill)"
                >-</div>
                <div :class="{'skills-list__incdec--disabled': tempSkillPoints <= 0 || tempCharacterSkills[skill.id] >= skill.maxLevel}"
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

            <button :disabled="tempSkillPoints === skillPoints"
                class="btn btn-primary skills-list__apply"
                @click="saveStats()"
            >Save</button>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
// 1 import jobs from '../../../config/jobs.json';
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
            characterSkills: [0, 0],
            tempCharacterSkills: [0, 0],
            availableSkills: allSkills,
            skillPoints: 29,
            tempSkillPoints: 29
        };
    },
    computed: {
        ...mapGetters(['characterStatusPoints', 'characterJobId'])
    },
    methods: {
        openSkillInfo(skill) {
            this.skillInfo.show = true;
            this.skillInfo.name = skill.name;
            this.skillInfo.maxLevel = skill.maxLevel;
            this.skillInfo.explanation = skill.explanation;
        },
        decreaseTempSkill(skill) {
            // If skill wasn't tempered with, we do not allow to decrease it
            if (this.characterSkills[skill.id] === this.tempCharacterSkills[skill.id]) {
                return false;
            }

            this.tempSkillPoints++;

            this.tempCharacterSkills[skill.id]--;
        },
        increaseTempSkill(skill) {
            // Check if player have skill points and that skill is not already maximum
            if (this.tempSkillPoints <= 0 || this.tempCharacterSkills[skill.id] >= skill.maxLevel) {
                return false;
            }

            this.tempSkillPoints--;

            this.tempCharacterSkills[skill.id]++;
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