/**
 * Ensures web fonts are fully loaded into the browser document before measuring and rendering.
 */
export async function ensureFontsLoaded(
  fontFamily: string,
  weights: string[] = ['300', '400', '600', '700', '800']
): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts || !fontFamily) {
    return;
  }

  try {
    const promises = weights.map((weight) =>
      document.fonts.load(`${weight} 16px "${fontFamily}"`)
    );
    await Promise.all(promises);
  } catch (err) {
    // Non-fatal fallback if network is offline or font name has no remote URL
    console.warn(`Font load warning for "${fontFamily}":`, err);
  }
}
