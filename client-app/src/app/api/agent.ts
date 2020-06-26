import axios, { AxiosResponse } from 'axios';
import { IActivity, IActivitiesEnvelope } from '../models/activity';
import { history } from '../..';
import { toast } from 'react-toastify';
import { IUser, IUserFormValues } from '../models/user';
import { IProfile, IPhoto } from '../models/profile';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(
  config => {
    const token = window.localStorage.getItem('jwt');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(undefined, error => {
  const originalRequest = error.config;
  if (error.message === 'Network Error' && !error.response) {
    toast.error('Network error - make sure API is running!');
  }
  const { status, data, config } = error.response;
  if (status === 404) {
    history.push('/notfound');
  }
  if (status === 401 && originalRequest.url.endsWith('refresh')) {
    window.localStorage.removeItem('jwt');
    window.localStorage.removeItem('refreshToken');
    history.push('/')
    toast.info('Your session has expired, please login again');
    return Promise.reject(error);
  }
  if (status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    return axios.post('user/refresh', {
      'token': window.localStorage.getItem('jwt'),
      'refreshToken': window.localStorage.getItem('refreshToken')
    }).then(res => {
        window.localStorage.setItem('jwt', res.data.token);
        window.localStorage.setItem('refreshToken', res.data.refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return axios(originalRequest);
    })
  }
  if (
    status === 400 &&
    config.method === 'get' &&
    data.errors.hasOwnProperty('id')
  ) {
    history.push('/notfound');
  }
  if (status === 500) {
    toast.error('Server error - check the terminal for more info!');
  }
  throw error.response;
});


const responseBody = (response: AxiosResponse) => response.data;

const requests = {
  get: (url: string) =>
    axios
      .get(url)
      .then(responseBody),
  post: (url: string, body: {}) =>
    axios
      .post(url, body)
      .then(responseBody),
  put: (url: string, body: {}) =>
    axios
      .put(url, body)
      .then(responseBody),
  del: (url: string) =>
    axios
      .delete(url)
      .then(responseBody),
  postForm: (url: string, file: Blob) => {
    let formData = new FormData();
    formData.append('File', file);
    return axios
      .post(url, formData, {
        headers: { 'Content-type': 'multipart/form-data' }
      })
      .then(responseBody);
  }
};

const Activities = {
  list: (params: URLSearchParams): Promise<IActivitiesEnvelope> =>
    axios.get('/activities', {params: params}).then(responseBody),
  details: (id: string) => requests.get(`/activities/${id}`),
  create: (activity: IActivity) => requests.post('/activities', activity),
  update: (activity: IActivity) =>
    requests.put(`/activities/${activity.id}`, activity),
  delete: (id: string) => requests.del(`/activities/${id}`),
  attend: (id: string) => requests.post(`/activities/${id}/attend`, {}),
  unattend: (id: string) => requests.del(`/activities/${id}/attend`)
};

const User = {
  current: (): Promise<IUser> => requests.get('/user'),
  login: (user: IUserFormValues): Promise<IUser> =>
    requests.post(`/user/login`, user),
  register: (user: IUserFormValues): Promise<IUser> =>
    requests.post(`/user/register`, user),
  fbLogin: (accessToken: string) =>
    requests.post(`/user/facebook`, {accessToken}),
  refreshToken: (token: string, refreshToken: string) => {
    return axios.post(`/user/refresh`, {token, refreshToken})
      .then(res => {
        window.localStorage.setItem('jwt', res.data.token);
        window.localStorage.setItem('refreshToken', res.data.refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return res.data.token;
      })
  }
};

const Profiles = {
  get: (username: string): Promise<IProfile> =>
    requests.get(`/profiles/${username}`),
  uploadPhoto: (photo: Blob): Promise<IPhoto> =>
    requests.postForm(`/photos`, photo),
  setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
  deletePhoto: (id: string) => requests.del(`/photos/${id}`),
  updateProfile: (profile: Partial<IProfile>) =>
    requests.put(`/profiles`, profile),
  follow: (username: string) =>
    requests.post(`/profiles/${username}/follow`, {}),
  unfollow: (username: string) => requests.del(`/profiles/${username}/follow`),
  listFollowings: (username: string, predicate: string) =>
    requests.get(`/profiles/${username}/follow?predicate=${predicate}`),
  listActivities: (username: string, predicate: string) =>
    requests.get(`/profiles/${username}/activities?predicate=${predicate}`)
};

export default {
  Activities,
  User,
  Profiles
};
