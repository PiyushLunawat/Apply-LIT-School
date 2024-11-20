import fetchIntercept from 'fetch-intercept';
import Cookies from 'js-cookie';

export const RegisterInterceptor = () => {
    // console.log('RegisterInterceptor initialized'); // Logs when the interceptor is registered
    fetchIntercept.register({
        request: function (url, config = {}) {
            // console.log('Request Intercepted:', { url, config });

            // Get token from cookies
            const token = Cookies.get('user-token');

            // Ensure config.headers exists
            config.headers = {
                ...config.headers, // Preserve existing headers if any
                authorization: `Bearer ${token || ''}` // Add Authorization header
            };
            // console.log('Request ddvd:', { url, config });

            return [url, config];
        },
        requestError: function (error) {
            // console.error('Request Error Intercepted:', error);
            return Promise.reject(error);
        },
        response: function (response) {
            // console.log('Response Intercepted:', response);
            return response;
        },
        responseError: function (error) {
            // console.error('Response Error Intercepted:', error);
            return Promise.reject(error);
        }
    });
};
