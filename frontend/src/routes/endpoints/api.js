import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api/'

const LOGIN_URL = `${BASE_URL}token/`
const NOTES_URL = `${BASE_URL}notes/`
const REFRESH_URL = `${BASE_URL}token/refresh/`
const LOGOUT_URL = `${BASE_URL}logout/`
const AUTHENTICATED_URL = `${BASE_URL}authenticated/`
const REGISTER_URL = `${BASE_URL}register/`

export const login = async (username, password) => {
    const response = await axios.post(LOGIN_URL,
        { username: username, password: password },
        { withCredentials: true }

    )
    return response.data.success
}

export const refres_token = async () => {

    try {
        await axios.post(REFRESH_URL,
            {},
            { withCredentials: true }
        )
        return true

    } catch (error) {
        return false
    }

}

export const get_notes = async () => {
    try {
        const response = await axios.get(NOTES_URL,
            { withCredentials: true }

        )
        return response.data
    } catch (error) {
        return call_refresh(error, axios.get(NOTES_URL, { withCredentials: true }))
    }


}

const call_refresh = async (error, func) => {
    if (error.response && error.response.status === 401) {
        const tokenRefreshed = await refres_token();

        if (tokenRefreshed) {
            const retryResponse = await func();
            return retryResponse.data
        }
    }
    return false
}


export const logout = async () => {
    try {
        await axios.post(LOGOUT_URL,
            {},
            { withCredentials: true }
        )
        return true
    } catch (error) {
        return false
    }


}

export const is_authenticated=async()=>{
    try{
        await axios.post(AUTHENTICATED_URL,{},{withCredentials:true})
        return true
    }catch(error){
        return false

    }

}

export const register = async (username, email, password) => {
    const response = await axios.post(REGISTER_URL, {username, email, password}, { withCredentials: true });
    return response.data;
};