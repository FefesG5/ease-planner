export const finalizeTableForExport = (container: HTMLElement): void => {
  // Select all input elements within the container
  const inputs = container.querySelectorAll<HTMLInputElement>("input");

  inputs.forEach((input) => {
    const span = document.createElement("span");
    // Transfer the input's value to the span's text content
    span.textContent = input.value || "";
    // Match the span's style with the input's appearance
    const computedStyle = getComputedStyle(input);
    span.style.display = "inline-block";
    span.style.width = `${input.offsetWidth}px`;
    span.style.height = `${input.offsetHeight}px`;
    span.style.textAlign = "center";
    span.style.fontSize = computedStyle.fontSize;
    span.style.lineHeight = computedStyle.lineHeight;

    // Replace the input with the span
    input.parentNode?.replaceChild(span, input);
  });
};
