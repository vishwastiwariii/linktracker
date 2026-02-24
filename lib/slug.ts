const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LENGTH = 7;

export function generateSlug(): string {
    let slug = "";

    for (let i = 0; i < SLUG_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * ALPHABET.length);
        slug += ALPHABET[randomIndex];
    }

    return slug;
}