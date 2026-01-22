import wave
import math
import random
import struct
import os

def save_wav(filename, data, sample_rate=44100):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(data)

# --- SYNTH PRIMITIVES ---
def osc_sine(t, freq):
    return math.sin(2 * math.pi * freq * t)

def osc_square(t, freq):
    return 1.0 if osc_sine(t, freq) > 0 else -1.0

def osc_saw(t, freq):
    return 2.0 * ((t * freq) - math.floor(0.5 + t * freq))

def osc_noise():
    return random.uniform(-1, 1)

def apply_envelope(val, t, dur, attack=0.005, decay_curve=3):
    # Simple AD (Attack-Decay)
    if t < attack:
        amp = t / attack
    else:
        progress = (t - attack) / (dur - attack)
        if progress > 1: progress = 1
        amp = (1.0 - progress) ** decay_curve
    return val * amp

# --- GENERATORS (15 Types) ---

def gen_click(i, sr=44100):
    data = bytearray()
    dur = 0.05
    if i == 1: # Pure Sine Blip
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            val = apply_envelope(osc_sine(t, 2500), t, dur, 0.001, 5)
            data += struct.pack('<h', int(val * 20000))
            
    elif i == 2: # Square Retro (8-bit)
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            val = apply_envelope(osc_square(t, 1000), t, dur, 0.001, 8)
            data += struct.pack('<h', int(val * 15000))

    elif i == 3: # Sawtooth Zap (Tech)
        dur = 0.08
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            freq = 3000 * (1 - (t/dur)) # Pitch drop
            val = apply_envelope(osc_saw(t, freq), t, dur, 0.001, 4)
            data += struct.pack('<h', int(val * 15000))

    elif i == 4: # Noise Snap (Paper)
        dur = 0.02
        for t_s in range(int(dur * sr)):
             t = t_s / sr
             val = apply_envelope(osc_noise(), t, dur, 0.001, 2)
             data += struct.pack('<h', int(val * 18000))

    elif i == 5: # Woodblock (Organic)
        dur = 0.06
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            # Sine with distinct pitch resonate
            val = apply_envelope(osc_sine(t, 800), t, dur, 0.005, 3)
            # Add a bit of noise
            val += osc_noise() * 0.1 * (1-(t/dur))
            data += struct.pack('<h', int(val * 20000))

    elif i == 6: # Glass Ping
        dur = 0.2
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            # FM Synthesis: Carrier=2000, Modulator=400
            mod = osc_sine(t, 400) * 500 * math.exp(-t*10)
            val = apply_envelope(osc_sine(t, 2000 + mod), t, dur, 0.001, 10)
            data += struct.pack('<h', int(val * 22000))

    elif i == 7: # Water Drop
        dur = 0.08
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            # Pitch BEND UP
            freq = 600 + (1000 * math.sin(math.pi * t / dur))
            val = apply_envelope(osc_sine(t, freq), t, dur, 0.01, 4)
            data += struct.pack('<h', int(val * 22000))

    elif i == 8: # Typewriter (Mechanical)
        dur = 0.06
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            # Metal clank (inharmonic)
            val = osc_sine(t, 2000) * 0.5 + osc_sine(t, 3400) * 0.3 + osc_noise() * 0.2
            val = apply_envelope(val, t, dur, 0.001, 10)
            data += struct.pack('<h', int(val * 25000))

    elif i == 9: # Mouse Switch (Sharp High Click)
        dur = 0.015
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            val = apply_envelope(osc_sine(t, 5000), t, dur, 0, 5)
            data += struct.pack('<h', int(val * 25000))

    elif i == 10: # Bubble Pop
        dur = 0.04
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            # Low to High sweep
            freq = 400 + 400 * (t/dur)**2
            val = apply_envelope(osc_sine(t, freq), t, dur, 0.01, 2)
            data += struct.pack('<h', int(val * 25000))

    elif i == 11: # Static Spark
        dur = 0.03
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            val = osc_noise() if random.random() > 0.5 else 0 # Crackle
            val = apply_envelope(val, t, dur, 0, 10)
            data += struct.pack('<h', int(val * 25000))

    elif i == 12: # Muted Kick (Low Thud)
        dur = 0.08
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            freq = 150 * (1 - t/dur)
            val = apply_envelope(osc_sine(t, freq), t, dur, 0.005, 4)
            data += struct.pack('<h', int(val * 25000))

    elif i == 13: # Chirp (Bird)
        dur = 0.05
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            mod = osc_sine(t, 50) * 200 # Vibrato
            val = apply_envelope(osc_sine(t, 2000+mod), t, dur, 0.01, 2)
            data += struct.pack('<h', int(val * 15000))

    elif i == 14: # Coin Hit (Ring)
        dur = 0.15
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            # Two high freqs beating
            val = osc_sine(t, 4000) * 0.5 + osc_sine(t, 4050) * 0.5
            val = apply_envelope(val, t, dur, 0.005, 15)
            data += struct.pack('<h', int(val * 20000))

    elif i == 15: # Hollow Tap (Plastic)
        dur = 0.04
        for t_s in range(int(dur * sr)):
            t = t_s / sr
            val = apply_envelope(osc_sine(t, 1200), t, dur, 0.001, 5)
            # Add filtered noise (hacky filter: avg of noise)
            val += (osc_noise() * 0.3)
            data += struct.pack('<h', int(val * 18000))

    return data

def gen_shutter(i, sr=44100):
    # Shutters combine sounds (sequences)
    # Helper to generate sequence
    data = bytearray()
    
    if i == 1: # Classic DSLR
        # Thump (Low) + wait + Click (High)
        data += gen_click(12, sr) # Kick
        # Gap
        data += bytearray(int(0.04 * sr) * 2) 
        data += gen_click(8, sr) # Typewriter-ish
        
    elif i == 2: # Leaf Shutter (Quiet Tick-Tick)
        data += gen_click(9, sr)
        data += bytearray(int(0.01 * sr) * 2)
        data += gen_click(9, sr)

    elif i == 3: # Electronic Beep
        # Sine Beep
        dur=0.1
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = apply_envelope(osc_sine(t, 800), t, dur, 0.01, 2)
            data += struct.pack('<h', int(val * 15000))

    elif i == 4: # Film Winder
        # Buzzing saw
        dur=0.15
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = apply_envelope(osc_saw(t, 100), t, dur, 0.05, 2)
            val += osc_sine(t, 105)*0.5 # beating
            data += struct.pack('<h', int(val * 10000))

    elif i == 5: # Polaroid (Clunky)
        data += gen_click(5, sr) # Wood
        data += bytearray(int(0.05 * sr) * 2)
        data += gen_click(4, sr) # Noise

    elif i == 6: # Old SLR (Springy)
        # Metallic boing
        dur=0.2
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            freq = 200 + 100*math.sin(50*t) # FM
            val = apply_envelope(osc_sine(t, freq), t, dur, 0.01, 5)
            data += struct.pack('<h', int(val * 15000))

    elif i == 7: # Contax (Sharp Motor)
        # High fast zip
        dur=0.08
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = osc_saw(t, 2000 - 10000*t) # Chirp down
            val = apply_envelope(val, t, dur, 0.005, 5) 
            data += struct.pack('<h', int(val * 10000))

    elif i == 8: # Lomo (Plastic)
        data += gen_click(15, sr) # Hollow Tap
        data += bytearray(int(0.03 * sr) * 2)
        data += gen_click(15, sr)

    elif i == 9: # Cinema frame (Ch-k)
        data += gen_click(4, sr) # Noise
        data += gen_click(1, sr) # Blip

    elif i == 10: # Silenced (Fluff)
        dur=0.05
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = apply_envelope(osc_noise(), t, dur, 0.02, 2) # Soft noise
            data += struct.pack('<h', int(val * 8000))

    elif i == 11: # Flash Pop
        # Rising tone + noise
        dur=0.1
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = osc_sine(t, 500 + 5000*t) * 0.5
            val += osc_noise() * 0.5
            val = apply_envelope(val, t, dur, 0.001, 5)
            data += struct.pack('<h', int(val * 15000))

    elif i == 12: # Focus Lock (Beep Beep)
        data += gen_click(1, sr)
        data += bytearray(int(0.05 * sr) * 2)
        data += gen_click(1, sr)

    elif i == 13: # Holga (Spring)
        dur=0.12
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = osc_square(t, 150) * 0.5 + osc_noise()*0.5
            val = apply_envelope(val, t, dur, 0.01, 3)
            data += struct.pack('<h', int(val * 15000))

    elif i == 14: # Sci-Fi
        dur=0.1
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = osc_sine(t, 2000 * math.sin(t*100)) # LFO
            val = apply_envelope(val, t, dur, 0.01, 5)
            data += struct.pack('<h', int(val * 15000))

    elif i == 15: # Hydraulic
        dur=0.15
        for t_s in range(int(dur*sr)):
            t=t_s/sr
            val = osc_noise()
            # Low pass simulation (roughly) by adding prev value? No, simple envelope
            val = apply_envelope(val, t, dur, 0.05, 2)
            data += struct.pack('<h', int(val * 10000))

    return data

if __name__ == "__main__":
    os.makedirs('assets/sounds', exist_ok=True)
    
    for i in range(1, 16):
        try:
            d = gen_click(i)
            if d: save_wav(f'assets/sounds/click_{i}.wav', d)
            d = gen_shutter(i)
            if d: save_wav(f'assets/sounds/shutter_{i}.wav', d)
        except Exception as e:
            print(f"Error {i}: {e}")
        
    print("Generated 30 distinct sound files (15 Clicks, 15 Shutters).")
