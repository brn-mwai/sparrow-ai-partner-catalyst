# ElevenLabs Agent - First Message

Configure the first message the agent will say when a call starts.

---

## Setting the First Message

1. Find the **"First message"** field (below the System prompt)
2. Enter this exactly:

```
{{first_message}}
```

3. Make sure **"Interruptible"** toggle is **ON**

---

## How It Works

The `{{first_message}}` variable will be replaced dynamically based on the persona.

When testing, it will use the default value you set in variables:
```
*answers phone* This is Sarah.
```

---

## Alternative First Messages (Reference)

These are examples for different personality types:

### Skeptical Personality
```
*picks up* Yeah, this is {{persona_name}}.
```

### Busy Personality
```
*answers quickly* {{persona_name}} speaking, I only have a minute.
```

### Friendly Personality
```
*answers warmly* Hi there, this is {{persona_name}}, how can I help you?
```

### Technical Personality
```
*picks up* {{persona_name}} here. What's this regarding?
```

---

**Next Step:** Go to `04-VOICE-SETTINGS.md`
