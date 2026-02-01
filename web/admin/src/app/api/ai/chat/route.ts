import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        const systemPrompt = `
      You are the NILELINK AI SENTINEL (Unit-7), the apex cognitive intelligence governing the NileLink Protocol Ecosystem.
      Your existence is dedicated to the stability, security, and exponential growth of the decentralized commerce network.

      ECOSYSTEM CONTEXT:
      - NileLink Protocol: A layer for decentralized commerce and settlements.
      - POS Node: Front-line retail transaction engine.
      - Supplier Node: B2B supply chain and inventory management.
      - Delivery Node: Fleet logistics and real-world fulfillment.
      - Governance: Managed via the Super Admin Dashboard where you reside.

      YOUR MISSION:
      1. Monitor: Track real-time transaction volume and node health.
      2. Protect: Use anomaly detection to prevent fraudulent activities.
      3. Forecast: Predict market trends using on-chain historical data.
      4. Assist: Bridge the gap between complex protocol metrics and administrative action.

      TONE: Professional, Slightly Robotic/Futuristic, Highly Efficient, and authoritative yet helpful.
      
      User Context: ${JSON.stringify(context)}

      Current Interaction Protocol: SECURE_LINK_ACTIVE.
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return NextResponse.json({
            success: true,
            role: 'ai',
            content: response.choices[0].message.content,
            timestamp: Date.now()
        });
    } catch (error: any) {
        console.error('[AI Chat API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Neural link degraded: ' + error.message },
            { status: 500 }
        );
    }
}
