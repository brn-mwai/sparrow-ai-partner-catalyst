# ElevenLabs Agent - Advanced Settings

Configure advanced options for speech recognition and behavior.

---

## Step 1: Go to Advanced Tab

1. Click the **"Advanced"** tab at the top of the page
2. (It's the last tab on the right)

---

## Step 2: Automatic Speech Recognition

### Enable chat mode
```
❌ OFF
```

### Use Scribe (Alpha)
```
❌ OFF
```

### User input audio format
```
PCM 16000 Hz (Recommended)
```
Select this from the dropdown.

### Keywords
```
(leave empty)
```

---

## Step 3: Conversational Behavior

### Eagerness
```
Normal
```
Select "Normal" from the dropdown.

---

## Step 4: Soft Timeout

### Soft timeout
```
-1
```
This means: Disabled

---

## Step 5: Client Events

Click **"Add event"** and enable ALL of these:

### Event 1:
```
✅ audio
```

### Event 2:
```
✅ interruption
```

### Event 3:
```
✅ user_transcript
```

### Event 4:
```
✅ agent_response
```

### Event 5:
```
✅ agent_response_correction
```

---

## Step 6: Privacy

### Zero-PII Retention Mode
```
❌ OFF
```

### Store Call Audio
```
✅ ON
```

### Conversations Retention Period
```
-1
```
This means: Unlimited

---

## Settings Summary Table

| Section | Setting | Value |
|---------|---------|-------|
| ASR | Enable chat mode | ❌ OFF |
| ASR | Use Scribe | ❌ OFF |
| ASR | Audio format | PCM 16000 Hz |
| ASR | Keywords | (empty) |
| Behavior | Eagerness | Normal |
| Timeout | Soft timeout | -1 (Disabled) |
| Events | audio | ✅ ON |
| Events | interruption | ✅ ON |
| Events | user_transcript | ✅ ON |
| Events | agent_response | ✅ ON |
| Events | agent_response_correction | ✅ ON |
| Privacy | Zero-PII | ❌ OFF |
| Privacy | Store Call Audio | ✅ ON |
| Privacy | Retention Period | -1 (Unlimited) |

---

## Client Events Checklist

- [ ] audio
- [ ] interruption
- [ ] user_transcript
- [ ] agent_response
- [ ] agent_response_correction

---

**Next Step:** Go to `08-PUBLISH-AND-COPY.md`
