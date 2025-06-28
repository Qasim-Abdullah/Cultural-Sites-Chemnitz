import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/'

const LOGIN_URL = `${BASE_URL}token/`
const REFRESH_URL = `${BASE_URL}token/refresh/`
const LOGOUT_URL = `${BASE_URL}logout/`
const AUTHENTICATED_URL = `${BASE_URL}authenticated/`
const REGISTER_URL = `${BASE_URL}register/`
const MAP_LOCATION_URL = `${BASE_URL}locations/`
const USER_INFO_URL = `${BASE_URL}user-info/`
const DELETE_USER_URL = `${BASE_URL}delete/`

export const login = async (username, password) => {
    const response = await axios.post(LOGIN_URL,
        { username: username, password: password },
        { withCredentials: true }

    )
    return response.data.success
}

export const getUserInfo = async () => {
    try {
        const response = await axios.get(USER_INFO_URL, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        return null;
    }
};

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
        );
        return true
    } catch (error) {

        if (error.response?.status === 401) {
            // Treat as already logged out
            return true;
        }
        return false;
    }


};

export const deleteUser = async () => {
  try {
    const response = await axios.delete(DELETE_USER_URL, {
      withCredentials: true, // important for sending cookies (if using session or JWT cookies)
    });
    return response.status === 204; // or just return true if you want
  } catch (error) {
    console.error("Delete user failed:", error);
    return null;
  }
};

export const is_authenticated = async () => {
    try {
        await axios.post(AUTHENTICATED_URL, {}, { withCredentials: true })
        return true
    } catch (error) {
        return false

    }

}

export const register = async (first_name, last_name, username, email, password) => {
    const response = await axios.post(REGISTER_URL, { first_name, last_name, username, email, password }, { withCredentials: true });
    return response.data;
};

export const fetch_MAP_Locations = async (filters = {}) => {
    try {
        // Build query parameters from filters
        const params = new URLSearchParams();

        // Add filters as query parameters
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const url = params.toString() ? `${MAP_LOCATION_URL}?${params.toString()}` : MAP_LOCATION_URL;

        console.log('Making API request to:', url);
        console.log('With filters:', filters);

        const response = await axios.get(url, {
            withCredentials: true,
            timeout: 10000 // 10 seconds timeout
        });

        console.log('API Response status:', response.status);
        console.log('API Response data:', response.data);
        console.log('API Response data type:', typeof response.data);

        // Validate response
        if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error('Failed to fetch map locations:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });

        return call_refresh(error, () => {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });
            const url = params.toString() ? `${MAP_LOCATION_URL}?${params.toString()}` : MAP_LOCATION_URL;
            return axios.get(url, { withCredentials: true, timeout: 10000 });
        });
    }
};