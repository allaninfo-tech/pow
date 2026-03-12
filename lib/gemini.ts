// Firebase Gemini AI helper — used ONLY for server-side admin features
// like AI-powered challenge generation. Never used on the client auth flow.
// Requires Firebase Blaze plan (free usage: 1,500 requests/day for Gemini Flash).

import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

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

const SYSTEM_PROMPT = `You are an expert software engineering challenge designer for a platform called ProofStack.
Generate a realistic, detailed, professional coding challenge based on the user's prompt.
Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:
{
  "title": "string (concise challenge name)",
  "short_description": "string (1-2 sentences)",
  "client_scenario": "string (2-3 paragraph client brief explaining the business context and why this needs to be built)",
  "tier": number (1=Newbie, 2=Junior, 3=Mid, 4=Senior, 5=Elite),
  "mode": "Solo" | "Squad" | "Both",
  "functional_requirements": ["string", ...] (5-8 specific must-have features),
  "technical_constraints": ["string", ...] (4-6 technology rules or restrictions),
  "performance_constraints": ["string", ...] (3-5 performance/reliability requirements),
  "allowed_stack": ["string", ...] (list of allowed technologies/frameworks),
  "required_roles": ["string", ...] (e.g. "Frontend Specialist", "Backend Engineer"),
  "tags": ["string", ...] (4-6 topic tags),
  "evaluation_criteria": [
    { "name": "string", "weight": number, "description": "string" },
    ... (4-6 criteria, weights must sum to 100)
  ]
}`;

/**
 * Generate a full challenge object from a plain-English admin prompt.
 * e.g. "A real-time collaborative code editor challenge for senior engineers"
 */
export async function generateChallenge(prompt: string): Promise<GeneratedChallenge> {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: `Create a challenge for: ${prompt}` },
    ]);

    const raw = result.response.text().trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '');

    const parsed: GeneratedChallenge = JSON.parse(raw);

    // Sanity-clamp tier to 1–5
    parsed.tier = Math.max(1, Math.min(5, parsed.tier));

    return parsed;
}
