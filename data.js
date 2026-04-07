// ============================================================
//  KPI DATEN – Alle 2 Wochen / monatlich aktualisieren
//  Neue Einträge am Ende des jeweiligen Jahres-Arrays einfügen
// ============================================================

const KPI_DATA = {

  "2025": [
    {
      period: "2025-01-01",
      label: "Jan 25",
      kpis: {
        traffic:          6867,
        conversion_rate:  2.80,
        social_cr:        null,
        revenue:          39955.97,
        rps:              null,
        aov:              208.10,
        cart_abandon:     55.9,
        checkout_abandon: 32.4,
        returning:        null
      }
    },
    {
      period: "2025-02-01",
      label: "Feb 25",
      kpis: {
        traffic:          6187,
        conversion_rate:  2.15,
        social_cr:        null,
        revenue:          32339.08,
        rps:              null,
        aov:              243.15,
        cart_abandon:     57.5,
        checkout_abandon: 29.3,
        returning:        null
      }
    },
    {
      period: "2025-03-01",
      label: "Mär 25",
      kpis: {
        traffic:          8154,
        conversion_rate:  2.17,
        social_cr:        null,
        revenue:          50382.70,
        rps:              null,
        aov:              284.65,
        cart_abandon:     61.6,
        checkout_abandon: 33.0,
        returning:        null
      }
    },
    {
      period: "2025-04-01",
      label: "Apr 25",
      kpis: {
        traffic:          9068,
        conversion_rate:  2.21,
        social_cr:        null,
        revenue:          58748.00,
        rps:              null,
        aov:              293.74,
        cart_abandon:     63.4,
        checkout_abandon: 36.5,
        returning:        null
      }
    },
    {
      period: "2025-05-01",
      label: "Mai 25",
      kpis: {
        traffic:          9604,
        conversion_rate:  2.08,
        social_cr:        null,
        revenue:          63176.80,
        rps:              null,
        aov:              315.88,
        cart_abandon:     67.1,
        checkout_abandon: 29.8,
        returning:        null
      }
    },
    {
      period: "2025-06-01",
      label: "Jun 25",
      kpis: {
        traffic:          7277,
        conversion_rate:  2.10,
        social_cr:        null,
        revenue:          45593.54,
        rps:              null,
        aov:              297.997,
        cart_abandon:     66.1,
        checkout_abandon: 32.6,
        returning:        null
      }
    },
    {
      period: "2025-07-01",
      label: "Jul 25",
      kpis: {
        traffic:          6919,
        conversion_rate:  2.30,
        social_cr:        null,
        revenue:          45138.67,
        rps:              null,
        aov:              283.89,
        cart_abandon:     67.7,
        checkout_abandon: 39.5,
        returning:        null
      }
    },
    {
      period: "2025-08-01",
      label: "Aug 25",
      kpis: {
        traffic:          10023,
        conversion_rate:  1.55,
        social_cr:        null,
        revenue:          42259.04,
        rps:              null,
        aov:              272.64,
        cart_abandon:     64.8,
        checkout_abandon: 34.9,
        returning:        null
      }
    },
    {
      period: "2025-09-01",
      label: "Sep 25",
      kpis: {
        traffic:          6461,
        conversion_rate:  2.12,
        social_cr:        null,
        revenue:          36559.82,
        rps:              null,
        aov:              266.86,
        cart_abandon:     66.1,
        checkout_abandon: 32.5,
        returning:        null
      }
    },
    {
      period: "2025-10-01",
      label: "Okt 25",
      kpis: {
        traffic:          6462,
        conversion_rate:  1.84,
        social_cr:        null,
        revenue:          32929.08,
        rps:              null,
        aov:              276.72,
        cart_abandon:     68.3,
        checkout_abandon: 51.2,
        returning:        null
      }
    },
    {
      period: "2025-11-01",
      label: "Nov 25",
      kpis: {
        traffic:          8664,
        conversion_rate:  1.59,
        social_cr:        null,
        revenue:          39655.82,
        rps:              null,
        aov:              287.36,
        cart_abandon:     68.3,
        checkout_abandon: 52.4,
        returning:        null
      }
    },
    {
      period: "2025-12-01",
      label: "Dez 25",
      kpis: {
        traffic:          6239,
        conversion_rate:  1.38,
        social_cr:        null,
        revenue:          26385.83,
        rps:              null,
        aov:              306.81,
        cart_abandon:     65.6,
        checkout_abandon: 51.7,
        returning:        null
      }
    }
  ],

  "2026": [
    {
      period: "2026-01-01",
      label: "Jan 26",
      kpis: {
        traffic:          12427,
        conversion_rate:  0.81,
        social_cr:        null,
        revenue:          24953.45,
        rps:              null,
        aov:              162.00,
        cart_abandon:     30.6,
        checkout_abandon: 54.1,
        returning:        34.97
      }
    },
    {
      period: "2026-02-01",
      label: "Feb 26",
      kpis: {
        traffic:          11960,
        conversion_rate:  0.59,
        social_cr:        null,
        revenue:          23620.19,
        rps:              null,
        aov:              197.00,
        cart_abandon:     44.7,
        checkout_abandon: 54.5,
        returning:        36.4
      }
    },
    {
      period: "2026-03-01",
      label: "Mär 26",
      kpis: {
        traffic:          11567,
        conversion_rate:  1.24,
        social_cr:        0,
        revenue:          47778.68,
        rps:              null,
        aov:              270.41,
        cart_abandon:     46.0,
        checkout_abandon: 43.0,
        returning:        23.7
      }
    }
  ]

};

// ── KPI Metadaten ──
const KPI_META = {
  traffic: {
    label: "Shop Traffic",
    icon: "👥",
    unit: "",
    format: "number",
    trend: "higher_better",
    description: "Sessions im Shop"
  },
  conversion_rate: {
    label: "Conversion Rate",
    icon: "🎯",
    unit: "%",
    format: "percent",
    trend: "higher_better",
    description: "Allgemeine Conversion Rate"
  },
  social_cr: {
    label: "Social CR",
    icon: "📲",
    unit: "%",
    format: "percent",
    trend: "higher_better",
    description: "Conversion Rate via Social Media"
  },
  revenue: {
    label: "Gesamtumsatz",
    icon: "💰",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Gesamtumsatz im Zeitraum"
  },
  aov: {
    label: "Ø Bestellwert",
    icon: "💶",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Average Order Value (AOV)"
  },
  rps: {
    label: "Umsatz / Session",
    icon: "📈",
    unit: "€",
    format: "currency",
    trend: "higher_better",
    description: "Revenue per Session – auto berechnet"
  },
  cart_abandon: {
    label: "Warenkorb-Abbruch",
    icon: "🛒",
    unit: "%",
    format: "percent",
    trend: "lower_better",
    description: "Warenkorb-Abbruchrate"
  },
  checkout_abandon: {
    label: "Checkout-Abbruch",
    icon: "💳",
    unit: "%",
    format: "percent",
    trend: "lower_better",
    description: "Checkout-Abbruchrate"
  },
  returning: {
    label: "Wiederkehrende Kunden",
    icon: "🔁",
    unit: "%",
    format: "percent",
    trend: "higher_better",
    description: "Anteil wiederkehrender Kunden"
  }
};
