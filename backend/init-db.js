const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

const adminPassword = bcrypt.hashSync("admin123", 10);
const userPassword = bcrypt.hashSync("user123", 10);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.run("DROP TABLE IF EXISTS business_requests");
  db.run("DROP TABLE IF EXISTS services");
  db.run("DROP TABLE IF EXISTS service_categories");
  db.run("DROP TABLE IF EXISTS users");

  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE service_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT
    )
  `);

  db.run(`
    CREATE TABLE services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      shortDescription TEXT NOT NULL,
      fullDescription TEXT NOT NULL,
      startingPrice REAL NOT NULL,
      deliveryTime TEXT NOT NULL,
      impactMetric TEXT NOT NULL,
      iconLabel TEXT NOT NULL,
      isFeatured INTEGER NOT NULL DEFAULT 0,
      categoryId INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES service_categories(id)
    )
  `);

  db.run(`
    CREATE TABLE business_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      companyName TEXT NOT NULL,
      contactName TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      serviceId INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (serviceId) REFERENCES services(id)
    )
  `);

  db.run(
    `
    INSERT INTO users (name, email, password, role)
    VALUES
    (?, ?, ?, ?),
    (?, ?, ?, ?)
    `,
    [
      "Administrador NexaOps",
      "admin@nexaops.com",
      adminPassword,
      "admin",
      "Usuario Demo",
      "user@nexaops.com",
      userPassword,
      "user"
    ]
  );

  db.run(`
    INSERT INTO service_categories (name, slug, description)
    VALUES
    ('Automatización Operativa', 'automation', 'Servicios para automatizar procesos internos y reducir trabajo manual.'),
    ('Inteligencia Artificial', 'ai', 'Soluciones basadas en IA para análisis, asistencia y toma de decisiones.'),
    ('Análisis Predictivo', 'predictive-analytics', 'Modelos de predicción para anticipar riesgos, demanda y oportunidades.'),
    ('Transformación Digital', 'digital-transformation', 'Diseño e integración de plataformas digitales para empresas.')
  `);

  db.run(`
    INSERT INTO services (
      title, 
      shortDescription, 
      fullDescription, 
      startingPrice, 
      deliveryTime, 
      impactMetric,
      iconLabel,
      isFeatured,
      categoryId
    )
    VALUES
    (
      'Automatización de procesos administrativos',
      'Digitalización de tareas repetitivas para reducir tiempos operativos.',
      'Servicio enfocado en analizar procesos internos, identificar actividades repetitivas y crear flujos automatizados para mejorar la eficiencia de la empresa.',
      18000,
      '3 a 5 semanas',
      'Hasta 40% menos tiempo operativo',
      'AUTO',
      1,
      1
    ),
    (
      'Asistente empresarial con inteligencia artificial',
      'Implementación de asistentes inteligentes para consulta de información y soporte interno.',
      'Diseño de un asistente basado en IA que permite responder preguntas frecuentes, consultar datos internos y apoyar a equipos operativos o administrativos.',
      25000,
      '4 a 6 semanas',
      'Reducción de consultas manuales',
      'AI',
      1,
      2
    ),
    (
      'Dashboard ejecutivo de indicadores',
      'Panel visual para monitorear KPIs, costos, productividad y áreas críticas.',
      'Desarrollo de dashboards conectados a fuentes de datos para visualizar indicadores clave y facilitar la toma de decisiones estratégicas.',
      16000,
      '2 a 4 semanas',
      'Mayor visibilidad operativa',
      'BI',
      0,
      4
    ),
    (
      'Modelo predictivo de demanda',
      'Predicción de demanda para anticipar compras, ventas o capacidad operativa.',
      'Servicio de análisis histórico y construcción de modelos predictivos para anticipar comportamientos futuros y mejorar la planeación empresarial.',
      32000,
      '5 a 8 semanas',
      'Mejor planeación de recursos',
      'DATA',
      1,
      3
    ),
    (
      'Detección temprana de riesgos operativos',
      'Análisis predictivo para identificar fallas, retrasos o desviaciones antes de que ocurran.',
      'Implementación de modelos analíticos para detectar patrones de riesgo en procesos internos y generar alertas preventivas.',
      30000,
      '5 a 7 semanas',
      'Menos incidencias críticas',
      'RISK',
      0,
      3
    ),
    (
      'Integración de sistemas empresariales',
      'Conexión entre plataformas, APIs y bases de datos para centralizar información.',
      'Servicio orientado a integrar sistemas existentes de una empresa para evitar duplicidad de información y mejorar el flujo de datos.',
      22000,
      '4 a 7 semanas',
      'Datos centralizados',
      'API',
      0,
      4
    ),
    (
      'Optimización de flujo de trabajo con IA',
      'Análisis de procesos y recomendaciones inteligentes para mejorar productividad.',
      'Servicio que combina análisis de procesos, IA y automatización para encontrar cuellos de botella y proponer mejoras operativas.',
      28000,
      '4 a 6 semanas',
      'Mejora de productividad',
      'OPS',
      1,
      2
    ),
    (
      'Automatización de reportes empresariales',
      'Generación automática de reportes operativos, financieros o comerciales.',
      'Diseño de procesos que extraen, transforman y presentan información de forma automática para reducir trabajo manual en reportes.',
      15000,
      '2 a 3 semanas',
      'Reportes más rápidos',
      'REP',
      0,
      1
    )
  `);

  console.log("Base de datos creada correctamente con usuarios, categorías y servicios.");
});

db.close();