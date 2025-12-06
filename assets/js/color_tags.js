/**
 * Generates a consistent HSL color from a string.
 * @param {string} str - The input string (category name).
 * @returns {string} - The generated color in CSS HSL format.
 */
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Hue: Full range 0-360
  const h = Math.abs(hash % 360);
  // Saturation: Fixed high saturation for vibrancy (e.g., 70%)
  const s = 70;
  // Lightness: Fixed medium lightness for readability (e.g., 40-50% to work well with white text, or lighter for black text)
  // Let's aim for a range that generally supports white text, or we adapt.
  // Using 45% suggests a generally darker, richer color.
  const l = 45; 
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Calculates the YIQ contrast to decide text color (black or white).
 * Note: Since we are generating HSL, we might need to convert or approximate.
 * However, since we fix L at 45%, white text is almost always safe. 
 * But to be robust for the future if we randomize L, let's implement a checker.
 * 
 * For this version, since we control generation, we will FORCE white text on our rich dark colors.
 * But the prompt asked for "white or black" adjustment.
 * Let's make the generator slightly more random in Lightness to justify the contrast logic, 
 * or just implement the contrast logic for correctness.
 */

function getContrastColor(h, s, l) {
  // Simple logic: if lightness is high (> 60), use black text. Else white.
  return l > 60 ? '#000000' : '#ffffff';
}

function applyCategoryColors() {
  const categories = document.querySelectorAll('.category');
  categories.forEach(cat => {
    // Prefer data-category, fallback to innerText
    const text = cat.dataset.category ? cat.dataset.category.trim() : cat.innerText.trim();
    // Generate color
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    // Vary lightness slightly to have difference, but keep within reasonable bounds
    // Range 30% to 80%?
    const l = 30 + (Math.abs(hash) % 50); // 30-79
    const s = 60 + (Math.abs(hash) % 30); // 60-89
    
    const bgColor = `hsl(${h}, ${s}%, ${l}%)`;
    const textColor = getContrastColor(h, s, l);
    
    cat.style.backgroundColor = bgColor;
    cat.style.color = textColor;
    
    // Ensure styles that might override are handled (e.g. if CSS has !important, this won't work, 
    // but we will check CSS next). 
    // Also style the look to be a badge if it isn't already.
    cat.style.display = 'inline-block';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyCategoryColors();
});
