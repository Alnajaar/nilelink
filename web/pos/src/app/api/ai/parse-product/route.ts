import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Product Parsing API
 * Parses natural language or voice transcription into structured product data
 * Example: "Milk Almarai 1 liter" → { name: "Milk", brand: "Almarai", size: "1L", category: "Dairy" }
 */
export async function POST(req: NextRequest) {
    try {
        const { text, voiceTranscript } = await req.json();
        const input = voiceTranscript || text;

        if (!input || input.trim().length === 0) {
            return NextResponse.json(
                { error: 'Text or voiceTranscript is required' },
                { status: 400 }
            );
        }

        // Check if AI service is available
        const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL;

        if (!AI_SERVICE_URL || AI_SERVICE_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
            return NextResponse.json({
                available: false,
                message: 'AI service is currently unavailable. Please enter product details manually.',
            });
        }

        try {
            // Call real AI backend service
            const response = await fetch(`${AI_SERVICE_URL}/parse-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input }),
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });

            if (!response.ok) {
                throw new Error(`AI service returned ${response.status}`);
            }

            const aiResult = await response.json();

            return NextResponse.json({
                available: true,
                parsed: {
                    name: aiResult.name || input,
                    brand: aiResult.brand || null,
                    size: aiResult.size || null,
                    category: aiResult.category || 'UNCATEGORIZED',
                    confidence: aiResult.confidence || 0,
                },
                original: input,
            });
        } catch (aiError) {
            console.error('[AI Product Parse Error]', aiError);

            // Fallback: Basic regex-based parsing
            return NextResponse.json({
                available: false,
                parsed: parseWithFallback(input),
                original: input,
                message: 'Using basic parsing (AI unavailable)',
            });
        }
    } catch (error) {
        console.error('[Product Parse API Error]', error);
        return NextResponse.json(
            { error: 'Failed to parse product data' },
            { status: 500 }
        );
    }
}

/**
 * Fallback parser using regex patterns
 * Not as accurate as AI, but functional when AI is offline
 */
function parseWithFallback(input: string) {
    const cleaned = input.trim();

    // Common brand patterns (Saudi/Egyptian market)
    const brands = ['Almarai', 'Nadec', 'Saudia', 'Panda', 'Americana', 'Juhayna', 'Domty'];
    let brand = null;

    for (const b of brands) {
        if (cleaned.toLowerCase().includes(b.toLowerCase())) {
            brand = b;
            break;
        }
    }

    // Size patterns (e.g., "1L", "500g", "2kg")
    const sizeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(ml|l|liter|g|kg|oz|lb)/i);
    const size = sizeMatch ? `${sizeMatch[1]}${sizeMatch[2].toUpperCase()}` : null;

    // Category inference (basic)
    const categories: Record<string, string[]> = {
        'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
        'Beverages': ['juice', 'water', 'soda', 'tea', 'coffee'],
        'Snacks': ['chips', 'crackers', 'cookies', 'biscuit'],
        'Bakery': ['bread', 'buns', 'rolls'],
    };

    let category = 'UNCATEGORIZED';
    for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => cleaned.toLowerCase().includes(kw))) {
            category = cat;
            break;
        }
    }

    // Extract name (remove brand and size)
    let name = cleaned;
    if (brand) name = name.replace(new RegExp(brand, 'gi'), '').trim();
    if (size) name = name.replace(sizeMatch![0], '').trim();

    return {
        name: name || cleaned,
        brand,
        size,
        category,
        confidence: 0.5, // Low confidence for fallback
    };
}
