// Google Gemini AI helper — uses Google AI Studio REST API directly.
// Get a FREE API key at: https://aistudio.google.com/app/apikey
// Free quota: 1,500 requests/day, 1M tokens/minute — no billing required.
// Add to .env.local: NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

export interface GeneratedChallenge {
    title: string;
    short_description: string;
    client_scenario: string;
    tier: number;
    mode: 'Solo' | 'Squad' | 'Both';
    functional_requirements: string[];
    technical_constraints: string[];
    performance_constraints: string[];
    allowed_stack: string[];
    required_roles: string[];
    tags: string[];
    evaluation_criteria: { name: string; weight: number; description: string }[];
}

const SYSTEM_PROMPT = `You are an expert software engineering challenge designer for ProofStack, a competitive coding platform.
Generate a realistic, detailed, and professional coding challenge based on the user's prompt.
Return ONLY valid JSON with NO markdown fencing, NO explanation — just the raw JSON object matching this schema:
{
  "title": "concise challenge name",
  "short_description": "1-2 sentence summary",
  "client_scenario": "2-3 paragraph client brief explaining business context",
  "tier": 1-5 (1=Newbie 2=Junior 3=Mid 4=Senior 5=Elite),
  "mode": "Solo" or "Squad" or "Both",
  "functional_requirements": ["5-8 specific must-have features"],
  "technical_constraints": ["4-6 technology rules or restrictions"],
  "performance_constraints": ["3-5 performance/reliability requirements"],
  "allowed_stack": ["list of allowed tech"],
  "required_roles": ["e.g. Frontend Specialist", "Backend Engineer"],
  "tags": ["4-6 topic tags"],
  "evaluation_criteria": [
    {"name": "criterion name", "weight": number, "description": "what is evaluated"},
    ...4-6 items, weights sum to 100
  ]
}`;

/**
 * Generate a full challenge object from a plain-English admin prompt.
 * Requires NEXT_PUBLIC_GEMINI_API_KEY in .env.local
 */
export async function generateChallenge(prompt: string): Promise<GeneratedChallenge> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey');
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [{ parts: [{ text: `Create a challenge for: ${prompt}` }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 2048,
                    responseMimeType: 'application/json',
                },
            }),
        }
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error: ${err}`);
    }

    const json = await response.json();
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip accidental markdown fences just in case
    const cleaned = raw.trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '');

    const parsed: GeneratedChallenge = JSON.parse(cleaned);
    parsed.tier = Math.max(1, Math.min(5, parsed.tier));
    return parsed;
}
