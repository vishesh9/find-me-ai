/** Max points a brand can get in a single response (mention 1 + first paragraph 3 + mentions>2 bonus 2 + first position 2). */
export const MAX_SCORE_PER_RESPONSE = 8;

export interface AnalysisItem {
  brand: string;
  mentioned: boolean;
  totalMentions: number;
  firstPosition: number;
  inFirstParagraph: boolean;
  score: number;
}

export function analyzeResponse(
  text: string,
  brands: string[],
  _primaryBrand: string
): AnalysisItem[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const firstParagraph = paragraphs[0] || "";
  const lowerText = text.toLowerCase();

  const results = brands.map((brand) => {
    const lowerBrand = brand.toLowerCase();
    const regex = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = text.match(regex) || [];
    const totalMentions = matches.length;
    const mentioned = totalMentions > 0;
    const firstPosition = lowerText.indexOf(lowerBrand);
    const inFirstParagraph = firstParagraph.toLowerCase().includes(lowerBrand);

    return {
      brand,
      mentioned,
      totalMentions,
      firstPosition,
      inFirstParagraph,
    };
  });

  return results.map((res) => {
    let score = 0;
    if (res.mentioned) {
      score += 1;
      if (res.inFirstParagraph) score += 3;
      if (res.totalMentions > 2) score += 2;

      const competitors = results.filter((r) => r.brand !== res.brand && r.mentioned);
      const isBeforeAll = competitors.every((comp) => res.firstPosition < comp.firstPosition);
      if (res.mentioned && (competitors.length === 0 || isBeforeAll)) {
        score += 2;
      }
    }
    return { ...res, score };
  });
}
