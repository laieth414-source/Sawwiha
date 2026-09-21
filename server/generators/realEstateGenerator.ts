/**
 * Real Estate Domain Architectural Adviser & Dynamic Generator
 * Implements domain guidelines without enforcing a static template or fixed layout.
 */

import { buildComprehensiveSiteHtml } from '../siteGenerator';
import { getDomainGuidance } from '../domainGuidance';

export function generateRealEstateSite(prompt: string, analysis?: any): string {
  const guidance = getDomainGuidance('real_estate', prompt);

  const enrichedAnalysis = {
    ...analysis,
    siteType: analysis?.siteType || guidance.domainName,
    suggestedTitle: analysis?.suggestedTitle || (prompt.length > 25 ? prompt.substring(0, 25) : prompt) || 'منصة عقارية',
    features: analysis?.features || guidance.recommendedInteractiveFeatures,
  };

  return buildComprehensiveSiteHtml({
    title: enrichedAnalysis.suggestedTitle,
    siteType: enrichedAnalysis.siteType,
    prompt,
    analysis: enrichedAnalysis,
  });
}
