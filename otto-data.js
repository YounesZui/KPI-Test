// ============================================================
//  OTTO UMSATZDATEN – monatlich aktualisieren
//  Neue Einträge am Ende des jeweiligen Jahres-Arrays einfügen
//  Hinweis: Negative Werte = Retouren / Gutschriften
// ============================================================

const OTTO_DATA = {

  "2025": [
    { period: "2025-01-01", label: "Jan 25", revenue: 12937.30  },
    { period: "2025-02-01", label: "Feb 25", revenue: 7784.44   },
    { period: "2025-03-01", label: "Mär 25", revenue: 15863.15  },
    { period: "2025-04-01", label: "Apr 25", revenue: 1509.27   },
    { period: "2025-05-01", label: "Mai 25", revenue: 2730.27   },
    { period: "2025-06-01", label: "Jun 25", revenue: 6667.86   },
    { period: "2025-07-01", label: "Jul 25", revenue: -999.02   },
    { period: "2025-08-01", label: "Aug 25", revenue: 4109.10   },
    { period: "2025-09-01", label: "Sep 25", revenue: -638.33   },
    { period: "2025-10-01", label: "Okt 25", revenue: 2028.84   },
    { period: "2025-11-01", label: "Nov 25", revenue: -239.27   },
    { period: "2025-12-01", label: "Dez 25", revenue: -0.51     }
  ],

  "2026": [
    { period: "2026-01-01", label: "Jan 26", revenue: 0       },
    { period: "2026-02-01", label: "Feb 26", revenue: 0       },
    { period: "2026-03-01", label: "Mär 26", revenue: 3152.86 },
    { period: "2026-04-01", label: "Apr 26", revenue: 579.20  }
  ]

};

// Kanal-Konfiguration für pos-app.js
const CHANNEL_DATA  = OTTO_DATA;
const CHANNEL_LABEL = "Otto";
const CHANNEL_ICON  = "📦";
