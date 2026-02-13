# POS Self-order (minimal scaffold)

This project is a minimal Node.js + Express self-order system prototype.

Quick start:

1. Install dependencies:

```powershell
npm install
```

2. Edit `config.json` to add your printer IP (if networked), then run:

```powershell
npm start
```

Open http://localhost:3000 to try the self-order UI.

Printer: the server sends plain text to port 9100 by default (Epson network printers commonly accept raw ESC/POS on TCP 9100). You can change `config.json`.
