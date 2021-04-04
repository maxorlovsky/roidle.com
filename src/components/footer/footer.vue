<template>
    <footer class="footer">
        <div class="footer__version">v{{ version }}</div>
        <router-link to="/terms-and-conditions"
            class="footer__link"
        >{{ $t('footer.termsAndConditions') }}</router-link>
        <router-link to="/legal"
            class="footer__link"
        >{{ $t('footer.legal') }}</router-link>
    </footer>
</template>

<script>
export default {
    name: 'footer-component',
    data() {
        return {
            version: mo.version,
        };
    }
};
</script>