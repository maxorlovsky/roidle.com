// Mutations are always synchronous
export default {
    saveParty: (state, values) => {
        state.party = values;
    },
    displayDockedMenu: (state, values) => {
        state.dockedMenu = values;
    }
}