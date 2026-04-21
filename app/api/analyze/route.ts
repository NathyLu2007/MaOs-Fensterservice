import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const windowImages = formData.getAll('windowImages') as File[];
    const sealImage = formData.get('sealImage') as File | null;

    if (!windowImages.length && !sealImage) {
      return NextResponse.json({ error: 'Keine Bilder hochgeladen' }, { status: 400 });
    }

    async function toImageBlock(file: File): Promise<Anthropic.ImageBlockParam> {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
      return { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };
    }

    const windowBlocks = await Promise.all(windowImages.slice(0, 2).map(toImageBlock));
    const sealBlock = sealImage ? await toImageBlock(sealImage) : null;

    const allImages: Anthropic.ImageBlockParam[] = [...windowBlocks, ...(sealBlock ? [sealBlock] : [])];

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: [
            ...allImages,
            {
              type: 'text',
              text: `Du bist Experte für Fensterdichtungen und Fensterbau.
${sealBlock ? 'Das letzte Bild zeigt eine Nahaufnahme der vorhandenen Dichtung.' : ''}

Analysiere diese Fenster-Fotos für einen deutschen Fensterdichtungs-Service.
Antworte NUR mit diesem JSON (kein Text davor/danach):
{
  "windowType": "Kunststoff" | "Holz" | "Aluminium" | "Altbau-Holz" | "Unbekannt",
  "condition": "gut" | "porös" | "beschädigt" | "stark_beschädigt",
  "sealProfile": "E-Profil" | "P-Profil" | "D-Profil" | "K-Profil" | "Q-Profil" | "Pilzdichtung" | "Lippendichtung" | "Mitteldichtung" | "Unbekannt",
  "sealColor": "schwarz" | "grau" | "weiß" | "braun" | "Unbekannt",
  "confidence": 0-100,
  "profileConfidence": 0-100,
  "notes": "kurze Bemerkung auf Deutsch (max 1 Satz)"
}

Hinweis Dichtungsprofile:
- E-Profil: flaches E-förmiges Profil, häufig bei älteren Fenstern
- P-Profil: rundes/ovales Profil, weit verbreitet
- D-Profil: D-förmig, für Nut-Aufnahmen
- K-Profil: kleines schlankes Profil
- Q-Profil: quadratisch/rechteckig
- Pilzdichtung: pilzförmig mit breitem Kopf, modern
- Lippendichtung: weiche flexible Lippe
- Mitteldichtung: sitzt in der Mitte des Rahmens`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Ungültige AI-Antwort');

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({
      windowType: 'Unbekannt', condition: 'porös',
      sealProfile: 'Unbekannt', sealColor: 'Unbekannt',
      confidence: 0, profileConfidence: 0,
      notes: 'Analyse nicht möglich – bitte manuell prüfen.',
    });
  }
}
