# Audio Generation Scripts

This directory contains scripts for generating static audio files for the refinement meeting simulation.

## Overview

The refinement meeting uses pre-generated MP3 files to eliminate API calls for students while maintaining high-quality ElevenLabs voices.

## Files

- `generate-refinement-audio.js` - Main script to generate all 27 MP3 files
- `test-audio-generation.js` - Test script to validate setup before generation
- `README.md` - This documentation

## Quick Start

1. **Set up environment variable:**
   ```bash
   export ELEVENLABS_API_KEY="your_api_key_here"
   ```

2. **Test the setup:**
   ```bash
   node scripts/test-audio-generation.js
   ```

3. **Generate all audio files:**
   ```bash
   node scripts/generate-refinement-audio.js
   ```

## What Gets Generated

### Trial 1: File Upload Story (12 files)
- `sarah-opening.mp3` - Scrum Master opens meeting
- `bola-presentation.mp3` - BA presents file upload story
- `srikanth-question.mp3` - Developer asks about file limits
- `bola-answer.mp3` - BA clarifies file limits
- `srikanth-question-2.mp3` - Developer asks about PDF support
- `bola-answer-2.mp3` - BA confirms PDF support
- `lisa-technical.mp3` - Developer discusses implementation
- `srikanth-response.mp3` - Senior dev discusses backend
- `tom-testing.mp3` - QA discusses testing approach
- `sarah-sizing.mp3` - SM asks for story point estimate
- `srikanth-confirm.mp3` - Senior dev confirms 5 points
- `sarah-conclude.mp3` - SM concludes Trial 1

### Trial 2: Password Reset Story (14 files)
- `victor-presentation-2.mp3` - Victor presents password reset story
- `srikanth-check-2.mp3` - Developer confirms trigger condition
- `victor-confirm-2.mp3` - Victor confirms successful reset only
- `lisa-email-2.mp3` - Developer asks about email template
- `victor-template-2.mp3` - Victor provides template details
- `tom-tests-2.mp3` - QA outlines test requirements
- `victor-log-2.mp3` - Victor agrees to add logging
- `lisa-retry-ask-2.mp3` - Developer asks about retry logic
- `srikanth-retry-2.mp3` - Senior dev suggests retry approach
- `sarah-size-2.mp3` - SM initiates planning poker
- `srikanth-2pts-2.mp3` - Senior dev estimates 2 points
- `lisa-2pts-2.mp3` - Developer estimates 2 points
- `tom-2pts-2.mp3` - QA estimates 2 points
- `sarah-conclude-2.mp3` - SM concludes Trial 2

### Common (1 file)
- `sarah-goodbye.mp3` - SM ends meeting

## Voice Configuration

| Speaker | Role | Voice ID |
|---------|------|----------|
| Sarah | Scrum Master | `MzqUf1HbJ8UmQ0wUsx2p` |
| Bola | Business Analyst (Trial 1) | `xeBpkkuzgxa0IwKt7NTP` |
| Victor | Business Analyst (Trial 2) | `xeBpkkuzgxa0IwKt7NTP` |
| Srikanth | Senior Developer | `wD6AxxDQzhi2E9kMbk9t` |
| Lisa | Developer | `8N2ng9i2uiUWqstgmWlH` |
| Tom | QA Tester | `qqBeXuJvzxtQfbsW2f40` |

## Output

All MP3 files are saved to `public/audio/refinement/` and can be played by the refinement meeting without any API calls.

## Fallback System

If a pre-generated audio file is missing or fails to play, the system automatically falls back to ElevenLabs TTS API.

## Testing

The test script validates:
- ✅ Environment configuration
- ✅ File structure
- ✅ Transcript data completeness
- ✅ Voice ID validity
- ✅ Trial coverage
- ✅ Output path validity

## Troubleshooting

**"ELEVENLABS_API_KEY not found"**
- Set the environment variable: `export ELEVENLABS_API_KEY="your_key"`

**"HTTP 401: Unauthorized"**
- Check your API key is valid and has sufficient credits

**"HTTP 429: Too Many Requests"**
- The script includes rate limiting (500ms delay between requests)

**"File already exists"**
- The script skips existing files by default
- Delete existing files to regenerate them
























