export function fakeCloudinaryImage(url: string, alt: string, sortOrder = 0) {
  return {
    url,
    alt,
    publicId: `seed-${Math.random().toString(36).slice(2)}`,
    width: 800,
    height: 800,
    format: "jpg",
    bytes: 120000,
    sortOrder,
    isPrimary: sortOrder === 0,
  };
}
