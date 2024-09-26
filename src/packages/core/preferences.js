let Preferences = {
  'attr-prefix': 'r-'
};

export function setPreference(key, value) {
  Preferences[key] = value;
}

export function getPreference(key) {
  return Preferences[key];
}
