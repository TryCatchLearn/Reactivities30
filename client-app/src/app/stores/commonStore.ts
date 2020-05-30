import {RootStore} from './rootStore';
import { observable, action, reaction } from 'mobx';

export default class CommonStore {
    rootStore: RootStore;
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token);
                } else {
                    window.localStorage.removeItem('jwt')
                }
            }
        )

        reaction(
            () => this.refreshToken,
            refreshToken => {
                if (refreshToken) {
                    window.localStorage.setItem('refreshToken', refreshToken);
                } else {
                    window.localStorage.removeItem('refreshToken');
                }
            }
        )
    }

    @observable token: string | null = window.localStorage.getItem('jwt');
    @observable refreshToken: string | null = window.localStorage.getItem('refreshToken');
    @observable appLoaded = false;

    @action setToken = (token: string | null) => {
        this.token = token;
    }

    @action setRefreshToken = (refreshToken: string | null) => {
        this.refreshToken = refreshToken;
    }

    @action setAppLoaded = () => {
        this.appLoaded = true;
    }
}