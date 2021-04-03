const mixin = {
    methods: {
        parseItemToChat(itemName) {
            const message = `[Item:${itemName}]`;

            this.$store.commit('putIntoChat', message);
        },
        parseSkillToChat(skillName) {
            const message = `[Skill:${skillName}]`;

            this.$store.commit('putIntoChat', message);
        }
    }
};

export default mixin;