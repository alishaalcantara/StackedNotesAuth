/** Strip HTML tags from a string, safely handling null/undefined. */
export const stripHtml = (html) => (html ?? '').replace(/<[^>]*>/g, '')
