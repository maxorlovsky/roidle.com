import en from '../translations/en.json';

function translateString(path, replacerObj) {
    // Find proper translation
    const pathArr = String(path).split('.');

    // eslint-disable-next-line no-invalid-this
    let translationObj = this.translationObj;

    const translateSingleString = () => {
        for (let i = 0, len = pathArr.length; i < len; i++) {
            if (translationObj && translationObj[pathArr[i]]) {
                translationObj = translationObj[pathArr[i]];
            }
        }
    };

    const translationExists = (translation) => translation && typeof translation === 'string';

    translateSingleString();

    // Return path if translation is not found or incomplete
    if (!translationExists(translationObj)) {

        // Try to find default, local translation
        translationObj = en;
        translateSingleString();

        if (!translationExists(translationObj)) {
            const errorInfo = `[Error i18n] Translation for path ${path} is incomplete or not found.`;

            console.error(errorInfo);

            // Return dash if wrong/empty path was passed
            if (!path) {
                return '--';
            }

            return path;
        }
    }

    // Replace placeholders with values
    if (replacerObj) {
        const keys = Object.keys(replacerObj);

        let i = keys.length;

        while (i--) {
            const key = keys[i];

            translationObj = translationObj.split(`{${key}}`).join(replacerObj[key]);
        }
    }

    return translationObj;
}

const locale = {
    setupTranslations: ($vue) => {
        $vue.$t = translateString.bind({
            translationObj: en,
        });
    }
};

export { locale };