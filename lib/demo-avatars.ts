// Local, fixed demo portraits. These labels are fictional aliases, not the
// identities of the people photographed. Provenance: public/media/avatars/CREDITS.md.
const demoAvatars: Readonly<Record<string, string>> = {
  "alex": "alex.jpg",
  "alex upa": "alex.jpg",
  "mariana": "mariana.jpg",
  "mariana v": "mariana.jpg",
  "mariana v.": "mariana.jpg",
  "ana sofia": "ana.jpg",
  "sofia": "ana.jpg",
  "diego": "diego.jpg",
  "diego ramirez": "diego.jpg",
  "valeria": "valeria.jpg",
  "valeria gomez": "valeria.jpg",
  "juan pablo": "juan.jpg",
  "vida en upa": "campus.svg",
  "vida upa": "campus.svg",
  "campus": "campus.svg",
  "club de robotica": "robotica.svg",
  "robotica": "robotica.svg",
};

/** Only known demo aliases get a sample photo; custom users retain initials. */
export function demoAvatarSrc(name: string): string | undefined {
  const key = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
  const file = demoAvatars[key];
  return file ? `media/avatars/${file}` : undefined;
}
