// Firebase AI Logic — uses the Gemini Developer API backend (FREE tier).
// Enabled in Firebase Console → Build → AI Logic → Gemini Developer API → Enabled
// No billing required. Generous quota for production apps.

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

const SYSTEM_PROMPT = `You are an expert software engineering challenge designer for ProofStack, a competitive coding platform.
Generate a realistic, detailed, professional coding challenge based on the user's prompt.
Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:
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
    {"name": "name", "weight": number, "description": "what is evaluated"},
    ...4-6 items, weights must sum to 100
  ]
}`;

/**
 * Generate a full challenge object from a plain-English admin prompt.
 * Uses Firebase AI Logic → Gemini Developer API (free, no billing needed).
 */
export async function generateChallenge(prompt: string): Promise<GeneratedChallenge> {
    // GoogleAIBackend = Gemini Developer API (free tier via Firebase AI Logic)
    const ai = getAI(app, { backend: new GoogleAIBackend() });

    // Use gemini-2.5-flash-lite — Firebase's recommended free model going forward
    const model = getGenerativeModel(ai, {
        model: 'gemini-2.5-flash-lite',
        systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(`Create a challenge for: ${prompt}`);
    const raw = result.response.text().trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '');

    const parsed: GeneratedChallenge = JSON.parse(raw);
    parsed.tier = Math.max(1, Math.min(5, parsed.tier));
    return parsed;
}
