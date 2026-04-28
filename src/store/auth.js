const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';
const NAME_KEY = 'name';

export const setAuth = (token, role, name) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('name', name);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRole = () => {
  return localStorage.getItem(ROLE_KEY);
};

export const getName = () => {
  return localStorage.getItem(NAME_KEY);
};
