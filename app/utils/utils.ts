export const scrollToId = (elementId: string) => {
  const element = document.querySelector(`#${elementId}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}