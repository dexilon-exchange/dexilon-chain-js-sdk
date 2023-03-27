export function delay(delayInms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delayInms);
  });
}
