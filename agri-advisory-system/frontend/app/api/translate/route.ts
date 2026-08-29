import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // 1. Universally handle whatever keys your frontend sends
    let texts: string[] = [];
    if (Array.isArray(body.texts)) {
      texts = body.texts;
    } else if (Array.isArray(body.text)) {
      texts = body.text;
    } else if (typeof body.text === 'string') {
      texts = [body.text];
    } else if (typeof body.texts === 'string') {
      texts = [body.texts];
    } else {
      texts = ["Welcome to Agri Advisory"]; 
    }

    const targetLanguage = body.targetLanguage || body.target_language || body.language || body.lang || 'hi';

    if (targetLanguage === 'en' || targetLanguage === 'en-in') {
      return NextResponse.json({ 
        translatedTexts: texts,
        translated_text: texts[0],
        translation: texts[0]
      });
    }

    const sarvamKey = process.env.SARVAM_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Map language codes to Sarvam format
    const sarvamLangMap: Record<string, string> = {
      hi: 'hi-IN',
      'hi-in': 'hi-IN',
      te: 'te-IN',
      'te-in': 'te-IN',
      ta: 'ta-IN',
      'ta-in': 'ta-IN',
      kn: 'kn-IN',
      'kn-in': 'kn-IN',
    };
    const sarvamTarget = sarvamLangMap[targetLanguage] || 'hi-IN';

    // 2. Try Sarvam AI API first
    if (sarvamKey) {
      try {
        const translatedTexts: string[] = [];
        for (const text of texts) {
          if (!text || typeof text !== 'string' || !text.trim()) {
            translatedTexts.push(text || '');
            continue;
          }

          const apiRes = await fetch('https://api.sarvam.ai/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': sarvamKey,
            },
            body: JSON.stringify({
              input: text,
              source_language_code: 'en-IN',
              target_language_code: sarvamTarget,
              speaker_gender: 'Female',
              mode: 'formal',
              model: 'mayura:v1',
            }),
          });

          if (apiRes.ok) {
            const data = await apiRes.json();
            translatedTexts.push(data.translated_text || text);
          } else {
            const errorBody = await apiRes.text();
            console.error(`Sarvam API error response (${apiRes.status}):`, errorBody);
            translatedTexts.push(text);
          }
        }

        // If we successfully got translations, return them
        if (translatedTexts.length > 0) {
          return NextResponse.json({ 
            translatedTexts,
            translated_text: translatedTexts[0],
            translation: translatedTexts[0]
          });
        }
      } catch (sarvamErr) {
        console.warn('Sarvam translation exception, trying fallback...', sarvamErr);
      }
    } else {
      console.warn('SARVAM_API_KEY is not defined in environment variables.');
    }

    // 3. Fallback to OpenAI API if configured
    if (openaiKey) {
      const langNames: Record<string, string> = {
        hi: 'Hindi',
        te: 'Telugu',
        ta: 'Tamil',
        kn: 'Kannada'
      };
      const langName = langNames[targetLanguage] || targetLanguage;

      const prompt = `Translate the following array of English UI strings into ${langName}. Maintain the exact JSON array format with string elements back: ${JSON.stringify(texts)}`;

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });

      if (openAiRes.ok) {
        const data = await openAiRes.json();
        const content = data.choices[0].message.content;
        
        try {
          const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
          const translatedTexts = JSON.parse(cleanContent);
          
          if (Array.isArray(translatedTexts)) {
            return NextResponse.json({ 
              translatedTexts,
              translated_text: translatedTexts[0],
              translation: translatedTexts[0]
            });
          }
        } catch (parseErr) {
          console.error('OpenAI response JSON parse error:', content);
        }
      }
    }

    // 4. Safe fallback: Returns original text so UI never breaks or goes blank
    return NextResponse.json({ 
      translatedTexts: texts,
      translated_text: texts[0],
      translation: texts[0]
    }, { status: 200 });

  } catch (err: any) {
    console.error('Translation route unhandled error:', err);
    return NextResponse.json({ 
      translatedTexts: ["Translation Error"], 
      translated_text: "Translation Error", 
      translation: "Translation Error" 
    }, { status: 200 });
  }
}