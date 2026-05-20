import { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../providers/WorkspaceProvider.jsx';
import { useToast } from '../providers/ToastProvider.jsx';
import { api } from '../lib/api.js';
import { Icons } from '../components/Icons.jsx';
import { GlassPanel, SectionHeader, Tabs, EmptyState } from '../components/ui.jsx';

const SAMPLE_TEXT = 'Hello, this is a test of the ElevenLabs voice. The integration is working correctly.';

export default function VoiceAIPage() {
  const { active } = useWorkspace();
  const toast = useToast();
  const [tab, setTab] = useState('tts');
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState('Rachel');
  const [ttsText, setTtsText] = useState(SAMPLE_TEXT);
  const [ttsBusy, setTtsBusy] = useState(false);
  const [ttsAudio, setTtsAudio] = useState(null);

  const [recording, setRecording] = useState(false);
  const [sttBusy, setSttBusy] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const [callTo, setCallTo] = useState('+1');
  const [callMessage, setCallMessage] = useState('Hello, this is a test call from NeuronStack.');
  const [calls, setCalls] = useState([]);
  const [callBusy, setCallBusy] = useState(false);

  useEffect(() => { api.listVoices().then(setVoices).catch(() => {}); }, []);
  useEffect(() => {
    if (!active?.id) return;
    api.listCalls(active.id).then(setCalls).catch(() => {});
    const i = setInterval(() => api.listCalls(active.id).then(setCalls).catch(() => {}), 5000);
    return () => clearInterval(i);
  }, [active?.id]);

  const handleTTS = async () => {
    if (!ttsText.trim()) return;
    setTtsBusy(true);
    setTtsAudio(null);
    try {
      const r = await api.tts(active.id, ttsText, voice);
      setTtsAudio(r.audio_url);
      toast.success('Audio ready');
    } catch (e) { toast.error(e.message); }
    finally { setTtsBusy(false); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const buf = new Uint8Array(await blob.arrayBuffer());
        let bin = '';
        for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        const b64 = btoa(bin);
        setSttBusy(true);
        try {
          const r = await api.stt(active.id, b64, 'audio/webm');
          setTranscript(r.transcript || '(empty)');
          toast.success(`Transcribed (confidence ${(r.confidence * 100 | 0)}%)`);
        } catch (e) { toast.error(e.message); }
        finally { setSttBusy(false); }
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleCall = async () => {
    if (!/^\+\d{6,15}$/.test(callTo)) { toast.error('Phone must be E.164 (+15551234567)'); return; }
    if (!callMessage.trim()) { toast.error('Message required'); return; }
    setCallBusy(true);
    try {
      const r = await api.placeCall(active.id, callTo, callMessage.trim());
      toast.success(`Call queued (sid: ${r.twilio_sid?.slice(0, 12)}...)`);
      api.listCalls(active.id).then(setCalls);
    } catch (e) { toast.error(e.message); }
    finally { setCallBusy(false); }
  };

  if (!active) return null;

  return (
    <div className="page-scroll"><div className="page-inner">
      <SectionHeader title="Voice AI" subtitle="ElevenLabs TTS · Deepgram STT · Twilio outbound" />
      <Tabs tabs={[
        { id: 'tts', label: 'Text → Speech' },
        { id: 'stt', label: 'Speech → Text' },
        { id: 'calls', label: 'Outbound Calls' },
      ]} active={tab} onChange={setTab} style={{ marginBottom: 20 }} />

      {tab === 'tts' && (
        <GlassPanel style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', marginBottom: 12 }}>Synthesize speech</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Voice</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} style={{ width: 220, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}>
              {voices.length === 0 ? <option>Rachel</option> : voices.map((v) => <option key={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Text (max 5000 chars)</label>
            <textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} rows={4} className="input" style={{ resize: 'vertical' }} />
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{ttsText.length} / 5000</div>
          </div>
          <button className="btn btn-accent" onClick={handleTTS} disabled={ttsBusy || !ttsText.trim()}>
            {ttsBusy ? 'Generating...' : <><Icons.mic size={14} /> Generate audio</>}
          </button>
          {ttsAudio && (
            <div style={{ marginTop: 16 }}>
              <audio controls src={ttsAudio} style={{ width: '100%' }} />
              <a href={ttsAudio} download style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, display: 'inline-block' }}>Download MP3</a>
            </div>
          )}
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12 }}>Needs ElevenLabs key in Settings → Provider Keys.</p>
        </GlassPanel>
      )}

      {tab === 'stt' && (
        <GlassPanel style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', marginBottom: 12 }}>Transcribe from microphone</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            {!recording ? (
              <button className="btn btn-accent" onClick={startRecording} disabled={sttBusy}><Icons.mic size={14} /> Start recording</button>
            ) : (
              <button className="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }} onClick={stopRecording}>
                <Icons.pause size={14} /> Stop & transcribe
              </button>
            )}
            {sttBusy && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Sending to Deepgram...</span>}
            {recording && <span style={{ fontSize: 12, color: 'var(--accent)' }}>● Recording</span>}
          </div>
          {transcript && (
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {transcript}
            </div>
          )}
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12 }}>Needs Deepgram key in Settings → Provider Keys. Browser microphone permission required.</p>
        </GlassPanel>
      )}

      {tab === 'calls' && (
        <>
          <GlassPanel style={{ marginBottom: 16, maxWidth: 720 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)', marginBottom: 12 }}>Place outbound call (Twilio)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>To (E.164)</label>
                <input className="input" value={callTo} onChange={(e) => setCallTo(e.target.value)} placeholder="+15551234567" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, display: 'block' }}>Message to speak</label>
                <input className="input" value={callMessage} onChange={(e) => setCallMessage(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-accent" onClick={handleCall} disabled={callBusy}>
              {callBusy ? 'Placing...' : <><Icons.phone size={14} /> Place call</>}
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
              Twilio key must be JSON: <code>{`{"sid":"AC...","token":"...","from":"+1..."}`}</code>. Set under Settings → Provider Keys → Twilio.
            </p>
          </GlassPanel>

          <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
            {calls.length === 0 ? <EmptyState icon={<Icons.phone size={48} />} title="No calls yet" /> :
            <table className="ns-table">
              <thead><tr><th>Twilio SID</th><th>To</th><th>From</th><th>Direction</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {calls.map((c) => (
                  <tr key={c.id}>
                    <td><code className="mono" style={{ fontSize: 10 }}>{c.twilio_sid?.slice(0, 18) || '—'}</code></td>
                    <td className="mono" style={{ fontSize: 12 }}>{c.to_number}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{c.from_number}</td>
                    <td><span className={`badge badge-${c.direction === 'inbound' ? 'blue' : 'violet'}`}>{c.direction}</span></td>
                    <td><span className="badge badge-cyan">{c.status}</span></td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{c.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </GlassPanel>
        </>
      )}
    </div></div>
  );
}
