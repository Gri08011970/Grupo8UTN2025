// Clave en localStorage por email
const KEY = (email) => `profile:${(email || "").toLowerCase()}`;

/**
 * Lee el perfil guardado (name/phone) por email.
 * @param {string} email
 * @returns {{name?: string, phone?: string} | null}
 */
export function getProfile(email) {
  if (!email) return null;
  try {
    const raw = localStorage.getItem(KEY(email));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda/actualiza el perfil (name/phone) para un email.

 * @param {{email:string, name?:string, phone?:string}} param0
 */
export function saveProfile({ email, name, phone }) {
  if (!email) return null;
  const prev = getProfile(email) || {};
  const data = {
    name: name ?? prev.name ?? "",
    phone: phone ?? prev.phone ?? "",
  };
  localStorage.setItem(KEY(email), JSON.stringify(data));
  return data;
}

/**
 * Alias de compatibilidad para código existente.
 * Soporta dos firmas:
 *   savePhone(email, phone)
 *   savePhone({ email, phone, name? })
 */
export function savePhone(arg1, arg2) {
  if (typeof arg1 === "object") {
    const { email, phone, name } = arg1 || {};
    return saveProfile({ email, phone, name });
  }
  const email = arg1;
  const phone = arg2;
  return saveProfile({ email, phone });
}
