# Base64 Encoder / Decoder

**Live demo:** https://base64-toolkit-phi.vercel.app (Vercel) · [GitHub Pages mirror](https://babug01.github.io/base64-toolkit/)

Encode or decode Base64 (including the URL-safe alphabet) with correct UTF-8 handling — most
browser demos of `btoa`/`atob` break the moment you paste an emoji or an accented character; this
one doesn't. Runs entirely in the browser; nothing you paste ever leaves your machine.

## Features

- **Encode** arbitrary UTF-8 text to Base64 — routes through `TextEncoder` rather than calling
  `btoa` directly, since `btoa` only understands Latin1 and throws on real-world text
- **Decode** Base64 back to text, with a clear error if the input isn't valid Base64 or decodes to
  bytes that aren't valid UTF-8
- **URL-safe mode** — swaps `+/` for `-_` and drops padding, for anywhere the result goes in a URL
  or a JWT segment (where `+`, `/`, and `=` all have their own meaning)
- Accepts standard or URL-safe input transparently on decode
- Swap input/output, upload a file, download the result

## Why I built this

I got tired of the ad-heavy encode/decode sites for something I do constantly — checking a
Kubernetes Secret's decoded value, decoding a Basic Auth header, or building a URL-safe token by
hand. This is also one piece of a larger internal DevOps tool I built at work consolidating the
utility pages a platform engineer reaches for daily into one place — this repo is the Base64 piece,
cleaned up and open-sourced on its own.

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — no other runtime dependencies; the
  encoding itself is plain `TextEncoder`/`TextDecoder`/`btoa`/`atob`

## Running locally

```bash
git clone https://github.com/Babug01/base64-toolkit.git
cd base64-toolkit
npm install
npm run dev
```

## License

MIT — see [LICENSE](LICENSE).
