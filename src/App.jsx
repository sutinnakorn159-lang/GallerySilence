import React, { useState, useEffect, useRef } from 'react';
import { Headphones, X, BookOpen, Info, Volume2, VolumeX, Ghost, MapPin, Sparkles, Loader, PenTool, Play, Square, Pause } from 'lucide-react';

// --- Gemini API Helpers ---

const apiKey = ""; // System provides API Key

// 1. Text Generation (The Ghost Writer)
async function generateStoryFromGemini(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `คุณคือนักเล่าเรื่องที่มีอารมณ์ละเอียดอ่อน เข้าใจความเหงา ความเศร้า และความงามของสถานที่รกร้าง (Tone: Melancholic, Nostalgic, Wabi-sabi). 
              
              โจทย์: จงแต่งเรื่องสั้นๆ (Fiction) ภาษาไทย ความยาวไม่เกิน 4-5 ประโยค เกี่ยวกับ "${prompt}" 
              ให้ความรู้สึกเหมือนกำลังรำลึกความหลัง หรือจินตนาการถึงคนที่เคยอยู่ที่นั่น เน้นอารมณ์ "หน่วงๆ" แต่สวยงาม`
            }]
          }]
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "ความเงียบกลืนกินเรื่องราวไปหมดแล้ว...";
  } catch (error) {
    console.error("Gemini Gen Error:", error);
    return "เกิดข้อผิดพลาดในการเรียกวิญญาณของผู้เล่าเรื่อง...";
  }
}

// 2. Text-to-Speech (Voice of the Void)
async function generateSpeechFromGemini(text) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Fenrir" // Deep, slightly melancholic male voice
                }
              }
            }
          }
        }),
      }
    );
    const data = await response.json();
    const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }
    throw new Error("No audio data");
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
}

// Helper: Convert Base64 PCM to Wav Blob for playback
const pcmToWav = (base64PCM) => {
    const binaryString = window.atob(base64PCM);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const sampleRate = 24000; 
    const numChannels = 1;
    const bitsPerSample = 16;
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + bytes.length, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * bitsPerSample / 8, true);
    // bits per sample
    view.setUint16(34, bitsPerSample, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, bytes.length, true);

    const wavBlob = new Blob([view, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(wavBlob);
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};


// --- Main Component ---

const STORIES_DATA = [
  {
    id: 1,
    title: "ใจกลางกรุง",
    subtitle: "กรุงเทพฯ ใครต่างบอกว่ามีคนนับล้าน แต่ทำไมมันถึงเงียบขนาดนี้",
    location: "BANGKOK, TH",
    date: "28.01.2026",
    image: "/img/1.jpg", 
    fact: "แยก MBK สยาม ในเวลา 18.00 น. ผู้คนกำลังกลับบ้าน",
    fiction: "หลายต่อหลายคน บอกไว้ว่า กรุงเทพฯ เป็นเมืองที่เสียงดัง แปลกจัง? ฉันกลับไม่ได้ยินเสียงอะไรเลย เดินอยู่กลางผู้คนนับร้อย กลับได้ยินเพียงเสียงหัวใจตัวเอง และเสียงเพลงจากหูฟัง ผู้คนไม่มองกันและกัน ไม่คุยกันเลย ทำไมบางคนดูสนุก? ทำไมบางคนดูเครียดจัง? ทำไมบางคนเศร้าขนาดนี้? คนนั้นดีใจทำไมกัน? แปลกจัง ฉันอยากได้ยินเสียง ช่วยพูดให้ดังขึ้นหน่อยได้ไหม ฉันว่ามันค่อนข้างเหงา ถ้าฉันไม่ได้ยินเสียงผู้คน",
    mood: "DYSTOPIAN"
  },
  {
    id: 2,
    title: "ถนนคนรอ",
    subtitle: "เรารออะไรกันอยู่?",
    location: "SIAM SQUARE, BKK",
    date: "12.01.2026",
    image: "/img/2.jpg", 
    fact: "สยามสแควร์ ย่านการค้าใจกลางกรุงเทพฯ ผู้คนมากมายกำลังซื้อของและเดินทางกลับบ้านหลังเลิกงาน",
    fiction: "แปลกจัง ที่นี่ไม่มีใครรีบเร่งเลย ทุกคนกำลังเดินอย่างช้าๆ คล้ายกับรออะไรบางอย่าง แปลกจัง ที่นี่ไม่มีลมหนาว แต่กลับรู้สึกเย็นยะเยือก แปลกจัง ที่นี่ฉันไม่เคยมา แต่ทำไมรู้สึกคุ้นเคย แปลกจัง ที่นี่ไม่มีใครพูดคุยกัน แต่ทำไมฉันรู้สึกเหมือนมีใครกำลังเฝ้ามองอยู่ แปลกจัง ที่นี่ไม่มีคนที่ฉันรู้จัก แต่ทำไมฉันรู้สึกเหมือนกำลังรอใครสักคน",
    mood: "NOSTALGIA"
  },
  {
    id: 3,
    title: "จักรยานที่รอคอย",
    subtitle: "จักรยานที่ไม่มีคนขี่",
    location: "บรรทัดทอง กรุงเทพฯ",
    date: "26.01.2026",
    image: "/img/8.jpg", 
    fact: "จักรยานแม่บ้าน สนิมเกาะกิน อยู่ที่หน้าบ้านที่ไร้ร่องรอยการอยู่อาศัยมาเป็นเวลานาน",
    fiction: "เจ้าของคงรีบมาก จนลืมไปว่าเคยจอดทิ้งไว้ตรงนี้... หรือเขาอาจจะไม่ได้ตั้งใจจะทิ้งมัน แต่ชีวิตพาเขาไปไกลจนกลับมาไม่ได้ จักรยานคันนี้เลยกลายเป็นอนุสาวรีย์แห่งการรอคอย รอวันที่เจ้าของจะกลับมาปัดฝุ่น สูบลม แล้วปั่นมันออกไปปากซอยอีกครั้ง... ซึ่งวันนั้นคงไม่มีจริง",
    mood: "ISOLATION"
  },
  {
    id: 4,
    title: "หากต้องการคนไปส่ง",
    subtitle: "เรือที่กรุงเทพฯ เคยเจอปลาหรือเปล่า?",
    location: "บรรดทัดทอง กรุงเทพฯ",
    date: "15.01.2026",
    image: "/img/5.jpg", 
    fact: "เรือที่คอยรับส่งผู้คน ในคลองแสนแสบ ย่านบรรทัดทอง กรุงเทพฯ",
    fiction: "หลายต่อหลายครั้ง ที่ฉันอยากเห็นคนอื่นเป็นในสิ่งที่ฉันต้องการ หลายครั้ง ที่อยากให้คนอื่นคิดเหมือนที่ฉันคิด แต่ฉันก็ได้เห็นแค่ตัวเองเท่านั้นที่เป็นในสิ่งที่ฉันต้องการ เรือลำนี้เหมือนกัน ฉันไม่เคยรู้ว่ามันต้องการแบบไหน อยากเจอปลา หรือ อยากไปรับคน เหงาแย่เลยเนาะ ที่ต้องวนอยู่ในที่เดิมๆ จนถึงวันที่ไม่สามารถลอยอยู่บนน้ำได้ คงคล้ายๆกับ มนุษย์ที่ไม่สามารถหายใจบนโลกได้",
    mood: "ISOLATION"
  },
  {
    id: 5,
    title: "ซอยตันที่ฉันต้องเดินทุกวัน",
    subtitle: "บางทีซอยนี้ อาจจะเคยมีทางออกอยู่นะ",
    location: "ซอยโรงเรียนจารุณีวิทย์ กรุงเทพฯ",
    date: "07.01.2026",
    image: "/img/6.jpg", 
    fact: "ซอยโรงเรียนจารุณีวิทย์ ย่านบรรทัดทอง กรุงเทพฯ เป็นซอยตันที่มีบ้านเรือนอยู่อาศัย",
    fiction: "พลัดหลงมาไกลจัง ไกลพอที่จะลืมตัวตนของตัวเองแล้วมั้ง ลืมไปแล้วหรือยังว่าชอบอะไร? ชอบเดินจริงๆหรอ? เดินเพราะชอบ หรือชอบเพราะเดิน? ซอยนี้ก็คงพลัดจากเพื่อนมาไกลพอสมควร ข้างทาง ตามกำแพงที่ลวดลายงานศิลปะของศิลปินบางคนที่อาจจะแค่เดินผ่านมา หรือ อาจจะเคยอาศัยอยู่ที่นี่มาก่อน มีคนคิดถึงซอยนี้ไหมนะ อาจจะมีคนที่รอรับลูกที่ซอยนี้ เด็กโตหรือยังนะ คิดถึงไหมนะ อาจจะมีคนเลิกงาน แล้วเดินกลับทางนี้ ตอนนี้ยังทำงานอยู่ไหมนะ คิดถึงจังนะ",
    mood: "ISOLATION"
  },
  {
    id: 6,
    title: "โรงแรม",
    subtitle: "ก็แค่ที่พักชั่วคราว",
    location: "THE SPADES HOTEL, BKK",
    date: "19.01.2026",
    image: "/img/7.jpg", 
    fact: "โรงแรม The Spades ย่านบรรทัดทอง กรุงเทพฯ",
    fiction: "ฉันเคยคิดว่า ฉันเหนื่อยก็แค่พัก ฉันเคยคิดว่า ฉันเหงาก็แค่คุย ฉันเคยคิดว่า ฉันหิวก็แค่กิน แต่พอเวลาผ่านไป ฉันก็เริ่มรู้ว่า บางทีการพัก มันก็ไม่ได้ทำให้เราหายเหนื่อย การคุย มันก็ไม่ได้ทำให้เราหายเหงา และการกิน มันก็ไม่ได้ทำให้เราหายหิว ทำไมเราต้องทำตามสิ่งที่คิดว่าถูกต้อง เพียงเพราะคนอื่นๆบอกแบบนั้น ทำไมไม่คิดว่า ฉันเหนื่อย ฉันอาจจะแค่ต้องการของอร่อย ทำไมถึงไม่คิดว่า ฉันเหงา ฉันแค่อยากเดินเล่น ทำไมไม่คิดว่า ฉันหิว แต่ฉันไม่ได้อยากกินอะไรแล้ว ความต้องการจริงๆของฉันเป็นยังไง ใครกันแน่ที่รู้ วันนี้เป้าหมายของวัน ก็อาจจะแค่พักสักครู่",
    mood: "ISOLATION"
  },
    {
    id: 7,
    title: "ครึ่งนึง",
    subtitle: "ตรึ่งนึงของความเหงา",
    location: "ซอยโรงเรียนจารุณีวิทย์ กรุงเทพฯ",
    date: "29.01.2026",
    image: "/img/9.jpg", 
    fact: "ซอยโรงเรียนจารุณีวิทย์ ย่านบรรทัดทอง กรุงเทพฯ",
    fiction: "ตอนเด็กก็เข้าใจว่าต้องทำงานเพื่อหาเงินซื้อของเล่น ซื้อขนม พอโตมาถึงได้รู้ เราทำงานก็เพราะต้องเสียค่าใช้ชีวิตบนโลกนี้ แต่พอเราทำงาน กลับรู้สึกเสียเวลาในการใช้ชีวิตมากกว่า 8 ชั่วโมงต่อวัน บางทีเหมือนกับครึ่งนึงของในแต่ละวันของผม ถูกกลืนกินโดยสภาพแวดล้อมที่ไม่สนุก เอาเสียเลย จะเป็นอะไรไหม ถ้าผมไม่อยากจ่ายค่าใช้ชีวิตแล้ว และก็ไม่อยากเสียครึ่งนึงของวันแล้ว",
    mood: "ISOLATION"
  },
    {
    id: 8,
    title: "มีจดหมายมาส่งครับ",
    subtitle: "จดหมายฉบับสุดท้ายของคุณ ที่เขียนโดยลายมือมนุษย์",
    location: "ตู้ไปรษณีย์ ย่านบรรทัดทอง กรุงเทพฯ",
    date: "29.01.2026",
    image: "/img/10.jpg", 
    fact: "ตู้ไปรษณีย์ ย่านบรรทัดทอง กรุงเทพฯ",
    fiction: "ความมหัศจรรย์ของตัวอักษรในจดหมาย คือ ตัวอักษรจะมีเสียงในหัวของผู้เขียนถึงเสมอ ไม่ว่าผู้เขียนจะเศร้า เสียใจ ดีใจ เราจะรับรู้ผ่านตัวอักษรที่กำลังโลดแล่นบนบรรทัดที่ถูกกำหนดขึ้นมาเองจากจินตนาการของกระดาษที่ไร้เส้นบรรทัด หากผมสามารถมองเห็นรอยยิ้มของผู้เขียนได้ หรือ เห็นน้ำตาของผู้เขียนได้ จดหมายแต่ละฉบับที่อ่านได้รับ คงถูกรักษาเป็นอย่างดี เหมือนกับการเก็บรักษาความทรงจำที่มีชีวิตอยู่ตลอดเวลา",
    mood: "ISOLATION"
  },
    {
    id: 9,
    title: "ฉันแค่เดินชิดขวา",
    subtitle: "ไปและมาในเส้นทางของชีวิต",
    location: "ถนนบรรทัดทอง กรุงเทพฯ",
    date: "29.01.2026",
    image: "/img/11.jpg", 
    fact: "ถนนบรรทัดทอง กรุงเทพฯ",
    fiction: "บางครั้งชีวิตก็เหมือนการเดินทางบนถนนที่มีเส้นแบ่งเลนชัดเจน เราต้องเดินชิดขวา เพื่อหลีกเลี่ยงการชนกับผู้คนที่เดินสวนมา บางครั้งเราก็ต้องเร่งฝีเท้าเพื่อไม่ให้ใครแซงหน้าเราไปก่อน บางครั้งเราก็ต้องหยุดรอ เมื่อมีใครสักคนข้ามถนนอยู่ข้างหน้าเรา ชีวิตก็เช่นกัน เราต้องเรียนรู้ที่จะเดินไปข้างหน้าอย่างระมัดระวัง รู้ว่าเมื่อไหร่ควรเร่ง เมื่อไหร่ควรหยุด และเมื่อไหร่ควรปล่อยให้ใครสักคนผ่านไปก่อน เพราะในที่สุดแล้ว จุดหมายปลายทางของเราก็คือการเดินทางที่เต็มไปด้วยความเข้าใจและความอดทน",
    mood: "ISOLATION"
  },
    {
    id: 10,
    title: "ครึ่งฟ้าครึ่งไฟ",
    subtitle: "อยากให้ฟ้าร้อง แต่ก็กลัวไฟไหม้",
    location: "ถนนบรรทัดทอง กรุงเทพฯ",
    date: "29.01.2026",
    image: "/img/12.jpg", 
    fact: "ถนนบรรทัดทอง กรุงเทพฯ",
    fiction: "สายไฟในกรุงเทพฯ เป็นเหมือนเส้นเลือดใหญ่หรือสัญลักษณ์ของความยุ่งเหยิงในเมืองใหญ่ บางครั้งเด็กน้อยคนนี้อาจจะแค่อยากดูเมฆให้เต็มดวงตา ยากเนาะ ยากไปหมด",
    mood: "ISOLATION"
  },
];

const App = () => {
  const [stories, setStories] = useState(STORIES_DATA);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('fiction');
  const [isAmbientModalPlaying, setIsAmbientModalPlaying] = useState(false);
  const ambientAudioRef = useRef(null);
  
  // AI States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoryPrompt, setNewStoryPrompt] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  
  // TTS States
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Stop TTS if modal closes
    if (!selectedStory) {
        stopTTS();
    }
  }, [selectedStory]);

  const handleGenerateStory = async () => {
    if (!newStoryPrompt.trim()) return;
    setIsGeneratingStory(true);
    const generatedText = await generateStoryFromGemini(newStoryPrompt);
    
    const newStory = {
        id: Date.now(),
        title: "UNTITLED MEMORY",
        subtitle: newStoryPrompt,
        location: "IMAGINATION",
        date: "AI GENERATED",
        image: "https://images.unsplash.com/photo-1516738901171-8eb4fc2ab862?q=80&w=1000&auto=format&fit=crop", 
        fact: "เรื่องราวนี้ถูกสร้างขึ้นจาก AI ที่พยายามทำความเข้าใจความเหงาของมนุษย์ ข้อมูลความเป็นจริงยังคงเป็นปริศนา",
        fiction: generatedText,
        mood: "ARTIFICIAL"
    };

    setStories([newStory, ...stories]);
    setIsGeneratingStory(false);
    setShowCreateModal(false);
    setNewStoryPrompt("");
    
    setSelectedStory(newStory);
    setActiveTab('fiction');
  };

  const handlePlayTTS = async (text) => {
      if (isPlayingTTS) {
          stopTTS();
          return;
      }

      setIsGeneratingTTS(true);
      try {
          const base64Audio = await generateSpeechFromGemini(text);
          if (base64Audio) {
              const url = pcmToWav(base64Audio);
              setAudioUrl(url);
              setTimeout(() => {
                  if (audioRef.current) {
                      audioRef.current.play();
                      setIsPlayingTTS(true);
                  }
              }, 100);
          }
      } finally {
          setIsGeneratingTTS(false);
      }
  };

  const stopTTS = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setIsPlayingTTS(false);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-light selection:bg-white selection:text-black font-sans">
      {/* Hidden Audio Element for TTS */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setIsPlayingTTS(false)}
        />
      )}
      {/* Ambient Audio for Modal */}
      <audio
        ref={ambientAudioRef}
        src="/audio/1.mp3"
        loop
        style={{ display: 'none' }}
        onEnded={() => setIsAmbientModalPlaying(false)}
      />

      {/* Art Header & Nav */}
          <nav className="fixed top-0 left-0 w-full px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center z-40 bg-gradient-to-b from-black/90 to-transparent border-b border-zinc-900/40">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-4xl font-serif text-white tracking-tight drop-shadow-lg select-none">
                GALLERY OF SILENCE
              </h1>
              <span className="text-xs md:text-base text-zinc-600 font-light italic select-none">แกลเลอรี่แห่งความเงียบงัน</span>
            </div>
            {/* ลบปุ่มออกแล้ว */}
          </nav>

      {/* Main Content */}  
      <main className="container mx-auto px-6 md:px-12 pt-40 pb-20">
        
        {/* Minimal Hero */}
        <header className="mb-24 md:mb-32 border-l-4 border-zinc-800 pl-8 md:pl-16 py-4">
          <h2 className="text-4xl md:text-7xl font-serif text-zinc-200 leading-[0.9] tracking-tight mb-8 drop-shadow-xl">
            Where Silence Speaks
          </h2>
          <p className="max-w-lg text-zinc-500 font-light leading-relaxed text-base md:text-lg italic">
            โลกของภาพถ่ายและเรื่องราวที่ถูกทิ้งไว้ในความเงียบงัน ทุกภาพคือความเหงา ความเศร้า ความโดดเดี่ยว และความงามที่ไม่เคยถูกเล่า
          </p>
        </header>

        {/* Art Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
          {stories.map((story, index) => (
            <div 
              key={story.id}
              onClick={() => { setSelectedStory(story); setActiveTab('fiction'); }}
              className={`group cursor-pointer flex flex-col ${index % 2 !== 0 ? 'md:mt-24' : ''}`} // Offset layout
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 mb-6 w-full shadow-2xl rounded-xl group">
                {/* Artistic overlay for mood */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-zinc-900/30 to-transparent opacity-80 group-hover:opacity-30 transition-all duration-700 z-10 pointer-events-none" />
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-full object-cover grayscale brightness-60 contrast-150 transition-all duration-1000 ease-in-out transform rounded-xl"
                  style={{ filter: 'blur(0.5px)' }}
                />
                {/* Subtle vignette */}
                <div className="absolute inset-0 pointer-events-none rounded-xl" style={{boxShadow:'inset 0 0 120px 10px #000a'}} />
              </div>
              
              {/* Minimal Caption */}
              <div className="flex flex-col border-t border-zinc-900 pt-4 group-hover:border-zinc-700 transition-colors duration-500">
                 <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] text-zinc-600 tracking-widest font-mono">NO. 0{index + 1}</span>
                    <span className="text-[10px] text-zinc-600 tracking-widest uppercase">{story.mood}</span>
                 </div>
                 <h3 className="text-xl text-zinc-300 font-serif tracking-wide group-hover:text-white transition-colors">{story.title}</h3>
                 <p className="text-xs text-zinc-600 mt-1 font-light uppercase tracking-wider">{story.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-8 left-8 z-30 hidden md:block mix-blend-difference">
        <div className="text-[9px] text-zinc-500 tracking-[0.2em] flex flex-col gap-2 font-mono">
          <span>Exhibition BANGKOK</span>
          <span>CURATED BY BUNNY</span>
          <span>EST. 2026</span>
        </div>
      </footer>

      {/* Create Story Modal (Minimal) */}
      {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
              <div className="bg-black border border-zinc-800 p-12 max-w-lg w-full relative animate-fade-in">
                  <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"><X size={20}/></button>
                  
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4 block">Artist Mode</span>
                  <h3 className="text-2xl font-serif text-zinc-200 mb-8">
                      What haunts you today?
                  </h3>
                  
                  <input 
                    type="text" 
                    placeholder="e.g. A rusty swing in the rain..." 
                    value={newStoryPrompt}
                    onChange={(e) => setNewStoryPrompt(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 py-4 text-xl text-zinc-300 focus:outline-none focus:border-zinc-500 mb-12 placeholder-zinc-800 font-serif italic"
                    autoFocus
                  />
                  
                  <button 
                    onClick={handleGenerateStory}
                    disabled={isGeneratingStory || !newStoryPrompt}
                    className="w-full py-4 border border-zinc-800 text-zinc-400 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:border-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-all duration-500"
                  >
                      {isGeneratingStory ? 'Composing...' : 'Create Masterpiece'}
                  </button>
              </div>
          </div>
      )}

      {/* Story Detail Modal (Immersive) */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/95 animate-fade-in"
                onClick={() => {
                  setSelectedStory(null);
                  if (ambientAudioRef.current) {
                    ambientAudioRef.current.pause();
                    ambientAudioRef.current.currentTime = 0;
                    setIsAmbientModalPlaying(false);
                  }
                }}
            />
          
            {/* Content Container - Full Height Split */}
            <div className="relative w-full h-full flex flex-col md:flex-row animate-slide-up">
                
                {/* Close Btn */}
                <button 
                onClick={() => {
                  setSelectedStory(null);
                  if (ambientAudioRef.current) {
                    ambientAudioRef.current.pause();
                    ambientAudioRef.current.currentTime = 0;
                    setIsAmbientModalPlaying(false);
                  }
                }}
                className="absolute top-6 right-6 z-50 text-zinc-500 hover:text-white transition-colors"
                >
                <X size={24} strokeWidth={1} />
                </button>

                {/* Left: Image (Full height) */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-zinc-900 rounded-xl overflow-hidden">
                    <img 
                        src={selectedStory.image} 
                        alt={selectedStory.title}
                        className="w-full h-full object-cover grayscale brightness-60 contrast-150 opacity-80 blur-[0.5px] rounded-xl"
                    />
                    <div className="absolute inset-0 pointer-events-none rounded-xl" style={{boxShadow:'inset 0 0 120px 10px #000a'}} />
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col gap-2">
                         <h2 className="text-4xl md:text-6xl font-serif text-white mb-2 drop-shadow-lg">{selectedStory.title}</h2>
                         <p className="text-zinc-400 font-light tracking-widest text-xs uppercase">{selectedStory.location} — {selectedStory.date}</p>
                         {/* Ambient Sound Control */}
                         <button
                           onClick={e => {
                             e.stopPropagation();
                             if (!isAmbientModalPlaying) {
                               if (ambientAudioRef.current) {
                                 ambientAudioRef.current.pause();
                                 ambientAudioRef.current.currentTime = 0;
                                 ambientAudioRef.current.volume = 1;
                                 ambientAudioRef.current.play().catch((err) => {
                                   console.error("Ambient play error:", err);
                                   alert("ไม่สามารถเล่นเสียงได้: " + err.message);
                                 });
                               }
                               setIsAmbientModalPlaying(true);
                             } else {
                               if (ambientAudioRef.current) {
                                 ambientAudioRef.current.pause();
                                 ambientAudioRef.current.currentTime = 0;
                               }
                               setIsAmbientModalPlaying(false);
                             }
                           }}
                           className="mt-4 flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors bg-black/30 px-3 py-1 rounded-full border border-zinc-700/40 w-max"
                         >
                           {isAmbientModalPlaying ? <Volume2 size={16}/> : <VolumeX size={16}/>}
                           <span>{isAmbientModalPlaying ? 'หยุดเสียงบรรยากาศ' : 'เล่นเสียงบรรยากาศ'}</span>
                         </button>
                    </div>
                </div>

                {/* Right: Content (Minimal Typography) */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full bg-black flex flex-col p-8 md:p-20 overflow-y-auto">
                    
                    {/* Tabs as simple text links */}
                    <div className="flex gap-8 mb-16 border-b border-zinc-900 pb-4">
                        <button 
                        onClick={() => setActiveTab('fiction')}
                        className={`text-xs uppercase tracking-[0.2em] transition-all duration-300 pb-1
                            ${activeTab === 'fiction' ? 'text-white border-b border-white' : 'text-zinc-600 hover:text-zinc-400 border-b border-transparent'}`}
                        >
                        Fiction
                        </button>
                        <button 
                        onClick={() => setActiveTab('fact')}
                        className={`text-xs uppercase tracking-[0.2em] transition-all duration-300 pb-1
                            ${activeTab === 'fact' ? 'text-white border-b border-white' : 'text-zinc-600 hover:text-zinc-400 border-b border-transparent'}`}
                        >
                        Reality
                        </button>
                    </div>

                    <div className="flex-1">
                        <div className={`transition-all duration-700 ${activeTab === 'fiction' ? 'opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-4'}`}>
                            <p className="text-xl md:text-2xl leading-relaxed text-zinc-300 font-serif font-light italic">
                                "{selectedStory.fiction}"
                            </p>
                            
                            <div className="mt-16 pt-8 border-t border-zinc-900 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-700 tracking-widest uppercase">Audio Experience</span>
                                <button 
                                    onClick={() => handlePlayTTS(selectedStory.fiction)}
                                    disabled={isGeneratingTTS}
                                    className={`flex items-center gap-4 text-xs tracking-widest uppercase transition-all
                                    ${isPlayingTTS ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {isGeneratingTTS ? <Loader size={12} className="animate-spin"/> : isPlayingTTS ? <Square size={12} fill="currentColor"/> : <Play size={12} fill="currentColor"/>}
                                    <span>{isPlayingTTS ? 'Stop Narrator' : 'Listen'}</span>
                                </button>
                            </div>
                        </div>

                        <div className={`transition-all duration-700 ${activeTab === 'fact' ? 'opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-4'}`}>
                            <div className="space-y-12 font-mono text-xs text-zinc-500 leading-relaxed">
                                <div>
                                    <span className="block text-[10px] text-zinc-700 uppercase mb-2 tracking-widest">Architectural Note</span>
                                    <p className="text-zinc-400">{selectedStory.fact}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <span className="block text-[10px] text-zinc-700 uppercase mb-2 tracking-widest">Coordinates</span>
                                        <p className="text-zinc-400">13.7563° N, 100.5018° E</p>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-zinc-700 uppercase mb-2 tracking-widest">Status</span>
                                        <p className="text-zinc-400">Abandoned</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Hide scrollbar for gallery feel */
        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }
      `}</style>
    </div>
  );
};

export default App;