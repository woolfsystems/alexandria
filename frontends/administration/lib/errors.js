class AuthenticationRejected extends Error{ }
class AuthenticationError extends Error{ }
class ApplicationError extends Error{ }
class ConnectionError extends Error{ }
class ServiceError extends Error{ }
class APIError extends Error{ }

const LOGIN_OK = 'Login OK'
const LOGIN_REJECTED = 'User Rejected Login'
const LOGIN_FAILED = 'Login Failed'

export {
    AuthenticationRejected,
    AuthenticationError,
    ApplicationError,
    ConnectionError,
    ServiceError,
    APIError,

    LOGIN_OK,

    LOGIN_FAILED,
    LOGIN_REJECTED
}