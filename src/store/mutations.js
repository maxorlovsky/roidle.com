// Mutations are always synchronous
export default {
    saveTheState: (state, values) => {
        state.theState = values;
    }
}