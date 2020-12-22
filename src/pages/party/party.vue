<template>
    <section class="party">
        <div class="party__tabs">
            <div v-for="tab in tabs"
                :key="tab"
                :class="{'party__tabs__tab--active': tab === selectedTab, 'party__tabs__tab--disabled': tab === 'invites' && party}"
                class="party__tabs__tab"
                @click="selectTab(tab)"
            >{{ $t(`party.${tab}`) }} <span v-if="tab === 'invites'">({{ invites.length }})</span></div>
        </div>

        <div class="party__wrapper">
            <div v-if="selectedTab ==='party' && party"
                class="party__window"
            >
                <div class="party__window__members">
                    <div v-for="item in partyMembers"
                        :key="item.id"
                        class="party__window__members__member"
                    >
                        <avatar :head-style="item.headStyle"
                            :head-color="item.headColor"
                            :dye-color="item.dyeColor"
                            :head-gears="item.headGears"
                            :gender="item.gender"
                            :job="item.job"
                            :framed="true"
                        />
                        <div class="party__window__members__member__info">
                            {{ item.name }} ({{ item.baseLevel }}/{{ item.jobLevel }})<br>
                            {{ item.job }}<br>
                            {{ $t('global.location') }}: {{ item.location }}
                            <div v-if="item.online"
                                class="party__window__members__member__info--online"
                            >{{ $t('party.online') }}</div>
                            <div v-else
                                class="party__window__members__member__info--offline"
                            >{{ $t('party.offline') }}</div>
                        </div>

                        <div class="party__window__members__member__buttons">
                            <button v-if="partyLeader && item.id !== partyLeaderId"
                                :disabled="buttonLoading"
                                class="btn btn-sm btn-danger"
                                @click="kickConfirm(item.id)"
                            >{{ $t('party.kick') }}</button>
                            <button v-if="item.id === characterId"
                                :disabled="buttonLoading || (partyLeader && partyMembers.length > 1)"
                                class="btn btn-sm btn-danger"
                                @click="showLeave = true"
                            >{{ $t('party.leaveParty') }}</button>
                            <button v-if="item.id !== characterId"
                                :disabled="buttonLoading"
                                class="btn game-button"
                                @click="viewCharacter(item.name)"
                            >{{ $t('global.viewProfile') }}</button>
                        </div>
                    </div>

                    <div v-if="partyLeader"
                        class="party__window__button"
                    >
                        <button :disabled="buttonLoading"
                            class="btn btn-lg game-button"
                            @click="inviteToParty()"
                        >{{ $t('party.inviteToParty') }}</button>
                    </div>
                </div>
            </div>

            <div v-if="selectedTab ==='party'"
                class="party__window"
            >
                <div class="party__window__party-name">
                    <div class="form-heading">{{ $t('party.partyName') }}:</div>
                    <input v-model="createParty.name"
                        :placeholder="$t('party.partyName')"
                        :disabled="party"
                        type="text"
                    >
                </div>

                <div class="party__window__party-loot">
                    <div class="form-heading">{{ $t('party.lootDistribution') }}:</div>
                    <div class="form-check">
                        <input id="loot-party"
                            v-model="createParty.loot"
                            :disabled="partyMembers.length > 1"
                            type="radio"
                            value="party"
                        >
                        <label for="loot-party">{{ $t('party.randomPartyMember') }}</label>
                    </div>

                    <div class="form-check">
                        <input id="loot-leader"
                            v-model="createParty.loot"
                            :disabled="partyMembers.length > 1"
                            type="radio"
                            value="leader"
                        >
                        <label for="loot-leader">{{ $t('party.partyLeader') }}</label>
                    </div>
                </div>

                <div class="party__window__party-hunt">
                    <div class="form-heading">{{ $t('party.huntLink') }}:</div>
                    <div class="form-check">
                        <input id="hunt-together"
                            v-model="createParty.hunt"
                            type="radio"
                            value="together"
                        >
                        <label for="hunt-together">{{ $t('party.huntTogether') }}</label>
                    </div>
                    <div class="form-check">
                        <input id="hunt-independence"
                            v-model="createParty.hunt"
                            type="radio"
                            value="independent"
                        >
                        <label for="hunt-independence">{{ $t('party.huntIndependence') }}</label>
                    </div>
                </div>

                <div class="party__window__hunt-preference">
                    <div class="form-heading">{{ $t('party.huntPreferences') }}:</div>
                    <div class="form-check">
                        <input id="hunt-preference-caution"
                            v-model="createParty.huntPreference"
                            type="radio"
                            value="0"
                        >
                        <label for="hunt-preference-caution">{{ $t('party.huntPreferencesCaution') }}</label>
                    </div>

                    <div class="form-check">
                        <input id="hunt-preference-yolo"
                            v-model="createParty.huntPreference"
                            type="radio"
                            value="1"
                        >
                        <label for="hunt-preference-yolo">{{ $t('party.huntPreferencesYolo') }}</label>
                    </div>
                </div>

                <div v-if="!party"
                    class="party__window__button"
                >
                    <div v-if="disableOrganize"
                        class="party__window__message"
                    >{{ $t('party.needBasicLevelToOrganize', {
                        level: 7
                    }) }}</div>

                    <button :disabled="buttonLoading || disableOrganize"
                        class="btn btn-lg game-button"
                        @click="organizeParty()"
                    >{{ $t('party.organizeParty') }}</button>
                </div>
                <div v-else-if="partyLeader"
                    class="party__window__button"
                >
                    <button :disabled="buttonLoading"
                        class="btn game-button"
                        @click="updateParty()"
                    >{{ $t('party.updateParty') }}</button>
                </div>

                <div v-if="createPartyError"
                    :class="{'party__window__error--visible': createPartyError}"
                    class="party__window__error"
                    v-html="createPartyError"
                />
            </div>
            <div v-else
                class="party__window"
            >
                <div v-if="disableJoin"
                    class="party__window__message"
                >{{ $t('party.needBasicLevelToJoin', {
                    level: 5
                }) }}</div>

                <div v-if="invites.length"
                    class="party__window__members"
                >
                    <div v-for="item in invites"
                        :key="item.id"
                        class="party__window__members__member"
                    >
                        <div class="party__window__teams">
                            {{ $t('party.team') }}: {{ item.name }}<br>
                            {{ $t('party.members') }} ({{ item.membersAmount }}/5)
                        </div>

                        <div class="party__window__members__member__buttons">
                            <button :disabled="buttonLoading"
                                class="btn btn-sm btn-danger"
                                @click="declineInvite(item.id)"
                            >{{ $t('party.declineInvite') }}</button>
                            <button :disabled="buttonLoading || disableJoin"
                                class="btn game-button"
                                @click="acceptInvite(item.id)"
                            >{{ $t('party.acceptInvite') }}</button>
                        </div>
                    </div>
                </div>
                <div v-else
                    class="party__window__no-invites"
                >{{ $t('party.noInvites') }}</div>
            </div>
        </div>

        <div v-if="showInviteToPartyModal"
            class="party__invite"
        >
            <div class="party__invite__text">{{ $t('party.typeNameToInvite') }}</div>

            <div class="party__invite__name">
                <input ref="inviteName"
                    v-model="inviteToPartyName"
                    :placeholder="$t('party.characterName')"
                    type="text"
                >
            </div>

            <button class="btn btn-secondary"
                @click="closeInviteModal()"
            >{{ $t('global.cancel') }}</button>
            <button :disabled="buttonLoading || !inviteToPartyName"
                class="btn game-button"
                @click="inviteConfirm()"
            >{{ $t('party.invite') }}</button>

            <div v-if="inviteError"
                class="party__invite__error"
            >{{ inviteError }}</div>
        </div>

        <div v-if="showLeave"
            class="party__leave"
        >
            <div class="party__leave__caution-text">{{ $t('party.confirmationToLeave') }}</div>
            <div class="party__leave__actions">
                <button class="btn btn-secondary"
                    @click="leaveClose()"
                >{{ $t('global.no') }}</button>
                <button :disabled="buttonLoading"
                    class="btn btn-danger"
                    @click="leaveTeam()"
                >{{ $t('global.yes') }}</button>
            </div>
        </div>

        <div v-if="kickShow"
            class="party__leave"
        >
            <div class="party__leave__caution-text">{{ $t('party.confirmationToKick') }}</div>
            <div class="party__leave__actions">
                <button class="btn btn-secondary"
                    @click="kickClose()"
                >{{ $t('global.no') }}</button>
                <button :disabled="buttonLoading"
                    class="btn btn-danger"
                    @click="kickCharacter()"
                >{{ $t('global.yes') }}</button>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '@components/avatar/avatar.vue';

const partyPage = {
    components: {
        avatar
    },
    data() {
        return {
            tabs: ['party', 'invites'],
            selectedTab: 'party',
            createParty: {
                name: '',
                loot: 'party',
                hunt: 'together',
                huntPreference: 0
            },
            createPartyError: '',
            buttonLoading: false,
            showInviteToPartyModal: false,
            inviteToPartyName: '',
            inviteError: '',
            invites: [],
            disableJoin: true,
            disableOrganize: true,
            showLeave: false,
            kickMemberId: 0,
            kickShow: false
        };
    },
    computed: {
        ...mapGetters([
            'party',
            'partyName',
            'partyMembers',
            'partyLeader',
            'partyLeaderId',
            'partyLoot',
            'partyHunt',
            'partyHuntPreference',
            'characterId',
            'characterSkills'
        ])
    },
    watch: {
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[1] >= 5) {
                    this.disableJoin = false;
                }

                if (this.characterSkills[1] >= 7) {
                    this.disableOrganize = false;
                }
            }
        },
        partyName: {
            immediate: true,
            handler() {
                if (this.partyName) {
                    this.createParty.name = this.partyName;
                }
            }
        },
        partyLoot: {
            immediate: true,
            handler() {
                if (this.partyLoot) {
                    this.createParty.loot = this.partyLoot;
                }
            }
        },
        partyHunt: {
            immediate: true,
            handler() {
                if (this.partyHunt) {
                    this.createParty.hunt = this.partyHunt;
                }
            }
        },
        partyHuntPreference: {
            immediate: true,
            handler() {
                this.createParty.huntPreference = this.partyHuntPreference || 0;
            }
        }
    },
    mounted() {
        mo.socket.on('kickFromPartyComplete', () => {
            this.buttonLoading = false;

            this.kickClose();
        });

        mo.socket.on('partyInviteDeclineComplete', () => {
            this.buttonLoading = false;

            // Reset party invites
            mo.socket.emit('getPartyInvites');
        });

        mo.socket.on('partyInviteAcceptComplete', (response) => {
            this.buttonLoading = false;

            // In case of success we need to redirect user from invites page and show him the party
            if (response) {
                this.selectTab('party');

                // Reset invites to 0 since they are suppose to be all removed when user joins the party
                this.invites = [];

                // Sending request to get party data
                mo.socket.emit('getParty');
            }
        });

        mo.socket.on('getPartyInvitesComplete', (response) => {
            this.invites = response.teams;
        });

        mo.socket.on('leavePartyComplete', () => {
            this.buttonLoading = false;

            this.$store.commit('leaveParty');

            this.createParty.name = '';
            this.createParty.loot = 'party';
            this.createParty.hunt = 'together';
            this.createParty.huntPreference = 0;

            this.leaveClose();
        });

        mo.socket.on('updatePartyComplete', (response) => {
            this.buttonLoading = false;

            // If failed, display error message
            if (!response.status) {
                this.createPartyError = response.message;

                return false;
            }

            this.$store.commit('updateParty', {
                loot: this.createParty.loot,
                hunt: this.createParty.hunt,
                huntPreference: this.createParty.huntPreference
            });
        });

        mo.socket.on('organizePartyComplete', (response) => {
            this.buttonLoading = false;

            // If failed, display error message
            if (!response.status) {
                this.createPartyError = response.message;

                return false;
            }

            // If succeeded request to get party data
            mo.socket.emit('getParty');
        });

        mo.socket.on('partyInviteComplete', (response) => {
            this.buttonLoading = false;

            // If failed, display error message
            if (!response.status) {
                this.inviteError = response.message;

                return false;
            }

            // If succeeded just close invite modal
            this.closeInviteModal();
        });

        mo.socket.emit('getPartyInvites');
    },
    beforeDestroy() {
        mo.socket.off('partyInviteDeclineComplete');
        mo.socket.off('kickFromPartyComplete');
        mo.socket.off('partyInviteAcceptComplete');
        mo.socket.off('getPartyInvitesComplete');
        mo.socket.off('leavePartyComplete');
        mo.socket.off('updatePartyComplete');
        mo.socket.off('organizePartyComplete');
        mo.socket.off('partyInviteComplete');
    },
    methods: {
        leaveClose() {
            this.showLeave = false;
        },
        kickClose() {
            this.kickMemberId = 0;
            this.kickShow = false;
        },
        kickConfirm(id) {
            this.kickMemberId = id;
            this.kickShow = true;
        },
        declineInvite(partyId) {
            this.buttonLoading = true;

            mo.socket.emit('partyInviteDecline', partyId);
        },
        acceptInvite(partyId) {
            this.buttonLoading = true;

            mo.socket.emit('partyInviteAccept', partyId);
        },
        inviteConfirm() {
            this.buttonLoading = true;

            if (!this.inviteToPartyName) {
                return false;
            }

            mo.socket.emit('partyInvite', this.inviteToPartyName);
        },
        closeInviteModal() {
            this.showInviteToPartyModal = false;
            this.inviteToPartyName = '';
            this.inviteError = '';
        },
        inviteToParty() {
            this.showInviteToPartyModal = true;
            this.inviteToPartyName = '';
            this.inviteError = '';

            // Focus on field when it appears
            this.$nextTick(() => {
                this.$refs.inviteName.focus();
            });
        },
        selectTab(tab) {
            if (this.party && tab === 'invites') {
                return false;
            }

            this.selectedTab = tab;
        },
        kickCharacter() {
            this.buttonLoading = true;

            mo.socket.emit('kickFromParty', this.kickMemberId);
        },
        viewCharacter(name) {
            this.buttonLoading = true;

            this.$router.push(`/profile/${name}`);
        },
        leaveTeam() {
            this.buttonLoading = true;

            mo.socket.emit('leaveParty');
        },
        updateParty() {
            this.buttonLoading = true;

            mo.socket.emit('updateParty', this.createParty);
        },
        organizeParty() {
            this.buttonLoading = true;

            mo.socket.emit('organizeParty', this.createParty);
        }
    }
};

// Routing
mo.routes.push({
    path: '/party',
    component: partyPage
});

export default partyPage;
</script>