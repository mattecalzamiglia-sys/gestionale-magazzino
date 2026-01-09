# ⚡ QUICK START - Render + Supabase

## ✅ Già Fatto:
- [x] Account Supabase creato
- [x] Database configurato
- [x] Account Render creato
- [x] Progetto preparato

---

## 🚀 Prossimi 4 Step (20 minuti totali)

### STEP 4: Inizializza Database (5 min)
1. Vai su https://supabase.com/dashboard
2. Apri progetto → **SQL Editor** → **New query**
3. Copia/incolla contenuto di `database/schema.sql`
4. Click **Run**

### STEP 5: Push su GitHub (5 min)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUO_USER/gestionale.git
git push -u origin main
```

### STEP 6: Deploy Backend su Render (5 min)
1. https://dashboard.render.com/ → **New +** → **Web Service**
2. Connetti repository GitHub
3. Seleziona `gestionale-magazzino`
4. Configura:
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Environment Variables:
     ```
     DATABASE_URL=postgresql://postgres:GestMag2024!@db.ytybtrwrtfjaamhkhvht.supabase.co:5432/postgres
     PORT=3001
     NODE_ENV=production
     CORS_ORIGIN=*
     ```
5. Plan: **Free** → **Create**

### STEP 7: Aggiorna URL Frontend (5 min)
1. Copia URL Render (tipo `https://xxx.onrender.com`)
2. In `frontend/src/services/api.js` sostituisci URL
3. Push su GitHub

---

## 🎉 FATTO!

La tua app sarà live su Render gratuitamente!

⚠️ **Nota**: Il backend si "addormenta" dopo 15min di inattività (piano free), si risveglia in 30sec alla prima richiesta.

---

**Continua con STEP 4 nel README completo!** 📖
