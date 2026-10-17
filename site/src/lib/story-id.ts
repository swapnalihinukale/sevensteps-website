/** Story IDs become URL segments and optional enquiry context. */
export function isStoryId(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value);
}

export function storyPath(id: string): string {
  if (!isStoryId(id)) throw new Error('Story ID must use 1 to 80 lowercase letters, numbers and single hyphens.');
  return `/stories/${id}/`;
}
