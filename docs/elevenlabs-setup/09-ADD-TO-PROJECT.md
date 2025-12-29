# ElevenLabs Agent - Add to Sparrow Project

Add your new credentials to the Sparrow project.

---

## Step 1: Open .env.local

1. Open your Sparrow project folder
2. Find the file: `.env.local`
3. Open it in a text editor

---

## Step 2: Add Backup Credentials

Add these two lines to your `.env.local` file:

```bash
# Backup ElevenLabs Account (for failover)
ELEVENLABS_API_KEY_BACKUP=sk_paste_your_api_key_here
ELEVENLABS_AGENT_ID_BACKUP=agent_paste_your_agent_id_here
```

---

## Step 3: Replace with Your Values

Replace the placeholder values with your actual credentials:

### Before:
```bash
ELEVENLABS_API_KEY_BACKUP=sk_paste_your_api_key_here
ELEVENLABS_AGENT_ID_BACKUP=agent_paste_your_agent_id_here
```

### After (example):
```bash
ELEVENLABS_API_KEY_BACKUP=sk_abc123xyz456
ELEVENLABS_AGENT_ID_BACKUP=agent_4001kd5v9vwgfb385mpnh3wvtt69
```

---

## Step 4: Save the File

1. Save the `.env.local` file
2. Close the editor

---

## Step 5: Restart Development Server

Run this command in your terminal:

```bash
pnpm dev
```

Or if already running, press `Ctrl+C` to stop, then run again.

---

## Step 6: Verify Failover Works

Check the terminal logs when starting a call. You should see:

```
Trying ElevenLabs account: primary (priority: 1)
```

If primary fails, it will show:
```
Account primary credits issue, trying next...
Trying ElevenLabs account: backup (priority: 2)
```

---

## Complete .env.local Example

Your file should look something like this:

```bash
# Primary Account (original)
ELEVENLABS_API_KEY=sk_original_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_original_id_here

# Backup Account (new account you just created)
ELEVENLABS_API_KEY_BACKUP=sk_new_key_here
ELEVENLABS_AGENT_ID_BACKUP=agent_new_id_here

# (other variables...)
```

---

## Troubleshooting

### "Backup not being used"
- Make sure variable names are exactly correct
- Restart the dev server after changes

### "Both accounts failing"
- Check API keys are valid
- Check Agent IDs are complete (not abbreviated)
- Make sure both agents are published and "Live"

### "Error: No accounts available"
- Both accounts may be out of credits
- Wait 5 minutes for cooldown to reset
- Or add a third account

---

## Done!

Your Sparrow AI now has automatic failover between ElevenLabs accounts.

When the primary account runs out of credits, it will automatically switch to the backup account.
