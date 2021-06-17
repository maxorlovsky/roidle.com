<template>
    <div class="search-autocomplete">
        <div class="search-input">
            <input v-model="search"
                :placeholder="$t('global.search')"
                :readonly="buttonLoading"
                maxlength="50"
                type="text"
                @keydown.enter="enter"
                @keydown.down="down"
                @keydown.up="up"
                @keydown.esc="esc"
                @input="change"
            >
            <div v-show="search"
                class="search-input__close"
                @click="search = ''"
            >X</div>
        </div>

        <ul v-show="open"
            ref="search-dropdown"
            class="search-autocomplete__dropdown"
            :style="{'max-height': `${maxHeight}px`}"
        >
            <li v-for="(suggestion, index) in matches"
                :key="suggestion"
                :class="{'search-autocomplete__dropdown--active': isActive(index)}"
                @click="suggestionClick(index)"
            >
                {{ suggestion }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'search-autocomplete',
    props: {
        buttonLoading: {
            type: Boolean,
            default: false
        },
        suggestions: {
            type: Array,
            default: () => []
        },
        maxHeight: {
            type: Number,
            default: 280
        }
    },
    data() {
        return {
            search: '',
            open: false,
            current: 0
        };
    },
    computed: {
        matches() {
            return this.suggestions.filter((str) => {
                try {
                    return str.toLowerCase().indexOf(this.search.toLowerCase()) >= 0;
                } catch (e) {
                    return false;
                }
            });
        }
    },
    methods: {
        enter(index) {
            if (this.buttonLoading) {
                return false;
            }

            let search = '';

            if (typeof index === 'number') {
                search = this.matches[index];
            } else {
                search = this.matches[this.current];
            }

            if (search === this.search) {
                return false;
            }

            this.search = search;
            this.monsterData = null;

            this.open = false;

            this.$emit('loading', true);
            this.$emit('search', this.search);
        },
        up() {
            if (this.current > 0) {
                this.current--;
                this.scrollDropdown('up');
            }
        },
        down() {
            if (this.current < this.matches.length - 1) {
                this.current++;
                this.scrollDropdown('down');
            }
        },
        esc() {
            this.$refs['search-dropdown'].scrollTop = 0;
            this.search = '';
            this.current = 0;
            this.open = false;
        },
        scrollDropdown(scrollDirection) {
            const elementScrollTop = this.$refs['search-dropdown'].scrollTop;
            const elementMaximumPxHeight = this.maxHeight;
            const heightPxPerElement = 40;
            // Get current element top position depending on what currently selected
            const currentElementTopPosion = heightPxPerElement * this.current;

            if (scrollDirection === 'down' && currentElementTopPosion >= elementMaximumPxHeight) {
                this.$refs['search-dropdown'].scrollTop = Math.abs(elementMaximumPxHeight - heightPxPerElement - currentElementTopPosion);
            } else if (scrollDirection === 'up' && currentElementTopPosion < elementScrollTop) {
                this.$refs['search-dropdown'].scrollTop = currentElementTopPosion;
            }
        },
        isActive(index) {
            return index === this.current;
        },
        change() {
            if (this.buttonLoading) {
                return false;
            }

            if (!this.open) {
                this.open = true;
                this.current = 0;
            }
        },
        suggestionClick(index) {
            this.enter(index);
        }
    }
};
</script>