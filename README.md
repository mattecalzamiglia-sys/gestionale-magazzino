# 🚀 Gestionale Magazzino e Commesse - Render + Supabase

Sistema gestionale completo con **deployment automatico gratuito**.

## 🎯 Stack Tecnologico

- **Frontend**: React + Tailwind CSS → GitHub Pages (gratuito)
- **Backend**: Node.js + Express → Render.com (gratuito)
- **Database**: PostgreSQL → Supabase (gratuito)
- **CI/CD**: GitHub Actions → Deploy automatico
- **Costo totale**: €0/mese ✅

---

## ✅ Setup Già Completato

- ✅ Database Supabase configurato
- ✅ Credenziali salvate in `.env`
- ✅ Account Render.com creato
- ✅ Progetto pronto per il deploy

---

## 🚀 PROSSIMI STEP

### STEP 4: Inizializza Database Supabase

**Opzione A: Via Supabase Dashboard (più semplice)**

1. Vai su: https://supabase.com/dashboard
2. Apri il tuo progetto `gestionale-magazzino`
3. Click su **"SQL Editor"** nel menu laterale
4. Click su **"New query"**
5. Copia e incolla il contenuto del file `database/schema.sql`
6. Click su **"Run"**
7. Aspetta ~30 secondi

✅ Database inizializzato!

**Opzione B: Via riga di comando**

```bash
# Installa psql (se non ce l'hai già)
# Windows: scaricare da https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Esegui lo schema
psql "postgresql://postgres:GestMag2024!@db.ytybtrwrtfjaamhkhvht.supabase.co:5432/postgres" -f database/schema.sql
```

---

### STEP 5: Crea Repository GitHub

```bash
# Nella cartella del progetto
git init
git add .
git commit -m "Initial commit - Gestionale Render + Supabase"

# Crea repo su GitHub, poi:
git remote add origin https://github.com/TUO_USERNAME/gestionale-magazzino.git
git branch -M main
git push -u origin main
```

---

### STEP 6: Deploy Backend su Render

1. Vai su https://dashboard.render.com/
2. Click su **"New +"** → **"Web Service"**
3. Click su **"Connect repository"** → autorizza GitHub
4. Seleziona il tuo repository `gestionale-magazzino`
5. Compila i campi:
   - **Name**: `gestionale-backend`
   - **Region**: `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. **Environment Variables** → Click "Add Environment Variable":
   - `DATABASE_URL` = `postgresql://postgres:GestMag2024!@db.ytybtrwrtfjaamhkhvht.supabase.co:5432/postgres`
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `*`
7. **Plan**: Seleziona **Free**
8. Click **"Create Web Service"**

⏱️ Aspetta ~5-10 minuti per il primo deploy...

Quando vedi "Live" in verde, copia l'URL tipo:
```
https://gestionale-backend-xxxx.onrender.com
```

---

### STEP 7: Aggiorna Frontend con URL Backend

Nel file `frontend/src/services/api.js`, sostituisci:

```javascript
const API_BASE_URL = 'https://gestionale-backend-xxxx.onrender.com/api';
```

Poi:
```bash
git add .
git commit -m "Update API URL"
git push origin main
```

---

### STEP 8: Deploy Frontend su GitHub Pages

1. Nel repository GitHub, vai su **Settings** → **Pages**
2. Source: **"GitHub Actions"**
3. Creeremo il workflow nella prossima guida

---

## 📊 Struttura Progetto

```
gestionale-render/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── .env (con tue credenziali)
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── database/
│   └── schema.sql
└── render.yaml
```

---

## 🎯 Funzionalità

✅ **Magazzino Ricambi**
- CRUD completo
- Tracking giacenze
- Storico movimenti

✅ **Gestione Commesse**
- Scarico ricambi su commessa
- Registrazione ore lavoro
- Calcolo margini real-time

✅ **Anagrafiche**
- Dipendenti, Clienti, Fornitori

---

## 💰 Costi (tutto gratis!)

| Servizio | Piano | Costo |
|----------|-------|-------|
| Supabase | Free | €0 |
| Render.com | Free | €0 |
| GitHub | Free | €0 |
| **TOTALE** | | **€0/mese** |

**Limiti Free Tier:**
- Supabase: 500MB DB, 50K read/day
- Render: 750h/month, sleep dopo 15min inattività
- Per piccole aziende = sempre gratis!

---

## 🆘 Troubleshooting

**Backend non risponde dopo 15min**
→ Render free tier "dorme" dopo inattività. Si risveglia in ~30 secondi alla prima richiesta.

**CORS error**
→ Verifica che `CORS_ORIGIN=*` sia nelle variabili Render

**Database connection error**
→ Verifica DATABASE_URL in Render Environment Variables

---

## 📞 Prossimi Step

Dopo aver completato gli step sopra, il tuo gestionale sarà:
- ✅ LIVE e accessibile da ovunque
- ✅ Con deploy automatico da GitHub
- ✅ Completamente gratuito

**Continua con STEP 4!** 🚀
