const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

// Funzione per creare una tabella
function createTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: header, bold: true })],
        alignment: AlignmentType.CENTER
      })],
      shading: { fill: "E0E0E0" }
    }))
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ text: cell })]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows]
  });
}

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Titolo
      new Paragraph({
        text: "Guida per Collaboratori",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: "Gestionale Magazzino - Ambiente di Sviluppo e Test",
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),

      // Sezione 1: Panoramica
      new Paragraph({
        text: "1. Panoramica del Progetto",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "Il progetto è un gestionale per magazzino con le seguenti tecnologie:",
        spacing: { after: 200 }
      }),
      new Paragraph({ text: "• Frontend: React.js con Tailwind CSS", bullet: { level: 0 } }),
      new Paragraph({ text: "• Backend: Node.js con Express", bullet: { level: 0 } }),
      new Paragraph({ text: "• Database: PostgreSQL (Neon)", bullet: { level: 0 } }),
      new Paragraph({ text: "• Hosting: Render.com", bullet: { level: 0 }, spacing: { after: 300 } }),

      // Sezione 2: URL Ambienti
      new Paragraph({
        text: "2. URL degli Ambienti",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "Ambiente di TEST (per sviluppo e prove):",
        heading: HeadingLevel.HEADING_2
      }),
      createTable(
        ["Servizio", "URL"],
        [
          ["Frontend Test", "https://gestionale-magazzino-1.onrender.com"],
          ["Backend Test API", "https://gestionale-magazzino-test-backend.onrender.com/api"]
        ]
      ),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({
        text: "⚠️ Nota: Il primo accesso può richiedere 30-60 secondi (cold start del piano free).",
        spacing: { after: 300 }
      }),

      // Sezione 3: Setup Locale
      new Paragraph({
        text: "3. Setup Ambiente Locale",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "3.1 Prerequisiti",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({ text: "• Node.js versione 18 o superiore", bullet: { level: 0 } }),
      new Paragraph({ text: "• Git", bullet: { level: 0 } }),
      new Paragraph({ text: "• Un editor di codice (VS Code consigliato)", bullet: { level: 0 }, spacing: { after: 200 } }),

      new Paragraph({
        text: "3.2 Clonare il Repository",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "git clone https://github.com/mattecalzamiglia-sys/gestionale-magazzino.git",
        style: "code",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "cd gestionale-magazzino",
        shading: { fill: "F0F0F0" },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "3.3 Installare le Dipendenze",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "# Backend",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "cd backend && npm install",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "# Frontend",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "cd ../frontend && npm install",
        shading: { fill: "F0F0F0" },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "3.4 Configurare le Variabili d'Ambiente",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Crea un file .env nella cartella backend con:",
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "DATABASE_URL=postgresql://neondb_owner:npg_vkcadH1M6OUh@ep-still-sky-agrgc6eg-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "NODE_ENV=development",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "PORT=3001",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "CORS_ORIGIN=http://localhost:3000",
        shading: { fill: "F0F0F0" },
        spacing: { after: 200 }
      }),

      new Paragraph({
        text: "3.5 Avviare i Server",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({
        text: "Terminale 1 - Backend:",
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "cd backend && npm start",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "Terminale 2 - Frontend:",
        spacing: { after: 50 }
      }),
      new Paragraph({
        text: "cd frontend && npm start",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "Il frontend sarà disponibile su http://localhost:3000",
        spacing: { after: 300 }
      }),

      // Sezione 4: Workflow Git
      new Paragraph({
        text: "4. Workflow di Sviluppo (Git)",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "4.1 Branch Principali",
        heading: HeadingLevel.HEADING_2
      }),
      createTable(
        ["Branch", "Scopo"],
        [
          ["main", "Produzione - NON pushare direttamente"],
          ["feature/preventivo-trasferta", "Sviluppo nuove feature (ambiente test)"]
        ]
      ),
      new Paragraph({ text: "", spacing: { after: 200 } }),

      new Paragraph({
        text: "4.2 Come Contribuire",
        heading: HeadingLevel.HEADING_2
      }),
      new Paragraph({ text: "1. Assicurati di essere sul branch corretto:", spacing: { after: 50 } }),
      new Paragraph({
        text: "   git checkout feature/preventivo-trasferta",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({ text: "2. Aggiorna il branch con le ultime modifiche:", spacing: { after: 50 } }),
      new Paragraph({
        text: "   git pull origin feature/preventivo-trasferta",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({ text: "3. Fai le tue modifiche al codice", spacing: { after: 100 } }),
      new Paragraph({ text: "4. Committa le modifiche:", spacing: { after: 50 } }),
      new Paragraph({
        text: "   git add .",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "   git commit -m \"Descrizione delle modifiche\"",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({ text: "5. Pusha le modifiche:", spacing: { after: 50 } }),
      new Paragraph({
        text: "   git push origin feature/preventivo-trasferta",
        shading: { fill: "F0F0F0" },
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: "6. Render deployerà automaticamente le modifiche sull'ambiente test",
        spacing: { after: 300 }
      }),

      // Sezione 5: Struttura Progetto
      new Paragraph({
        text: "5. Struttura del Progetto",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "gestionale-magazzino/",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "├── backend/                 # Server Node.js/Express",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│   ├── src/",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│   │   ├── config/          # Configurazione database",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│   │   ├── controllers/     # Logica business",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│   │   ├── routes/          # Definizione API endpoints",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│   │   └── server.js        # Entry point",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "├── frontend/                # App React",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│   └── src/",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│       ├── components/      # Componenti riutilizzabili",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│       ├── pages/           # Pagine dell'app",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "│       └── services/        # Chiamate API",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "├── database/                # Script SQL",
        shading: { fill: "F0F0F0" }
      }),
      new Paragraph({
        text: "└── render.yaml              # Configurazione deploy",
        shading: { fill: "F0F0F0" },
        spacing: { after: 300 }
      }),

      // Sezione 6: API Endpoints
      new Paragraph({
        text: "6. API Endpoints Principali",
        heading: HeadingLevel.HEADING_1
      }),
      createTable(
        ["Metodo", "Endpoint", "Descrizione"],
        [
          ["GET", "/api/ricambi", "Lista tutti i ricambi"],
          ["POST", "/api/ricambi", "Crea nuovo ricambio"],
          ["GET", "/api/commesse", "Lista tutte le commesse"],
          ["POST", "/api/commesse", "Crea nuova commessa"],
          ["GET", "/api/anagrafiche/clienti", "Lista clienti"],
          ["GET", "/api/anagrafiche/fornitori", "Lista fornitori"],
          ["GET", "/api/anagrafiche/dipendenti", "Lista dipendenti"],
          ["GET", "/api/health", "Health check"]
        ]
      ),
      new Paragraph({ text: "", spacing: { after: 300 } }),

      // Sezione 7: Contatti
      new Paragraph({
        text: "7. Contatti e Supporto",
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({
        text: "Per domande o problemi, contatta il proprietario del repository su GitHub.",
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: "Repository: https://github.com/mattecalzamiglia-sys/gestionale-magazzino",
        spacing: { after: 400 }
      }),

      // Footer
      new Paragraph({
        text: "Documento generato il " + new Date().toLocaleDateString('it-IT'),
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      })
    ]
  }]
});

// Crea la cartella docs se non esiste
const docsDir = path.join(__dirname);
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Genera il documento
Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(docsDir, 'Guida_Collaboratori_Gestionale.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Documento creato:', outputPath);
});
