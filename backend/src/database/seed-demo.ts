import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import {
  Message,
  MessageRole,
} from 'src/conversations/entities/message.entity';

// Carga .env sin depender de dotenv: el seed corre como script standalone
function loadEnvFile(): void {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@cherry.app';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo1234';
const DEMO_NAME = process.env.DEMO_NAME || 'Usuario Demo';

const PROJECT_NAME = 'Efecto Fotoeléctrico y Naturaleza Cuántica de la Luz';
const PROJECT_DESCRIPTION =
  'Proyecto de ejemplo para explorar Cherry: edición colaborativa de LaTeX, compilación a PDF y asistente de escritura científica.';

const MAIN_TEX = String.raw`\documentclass[journal]{IEEEtran}
\usepackage[spanish]{babel}
\usepackage[utf8]{inputenc}
\usepackage{graphicx}

\begin{document}
\title{El Efecto Fotoeléctrico y la Naturaleza Cuántica de la Luz}
\author{Usuario Demo}

\maketitle

\begin{abstract}
Este trabajo revisa el efecto fotoeléctrico como evidencia histórica de la
cuantización de la luz. Se presenta el modelo teórico de Einstein, las
predicciones verificadas experimentalmente por Millikan y sus implicaciones
para la dualidad onda-corpúsculo.
\end{abstract}

\section{Introducción}
\label{intro}
La radiación electromagnética fue concebida durante el siglo XIX como una onda
continua. Sin embargo, los experimentos de emisión de electrones por metales
iluminados revelaron comportamientos imposibles de reconciliar con dicho modelo.

\section{Marco Teórico}
\label{theory}
En 1905, Einstein propuso que la energía luminosa se transmite en cuantos
discretos de valor $E = h\nu$, donde $h$ es la constante de Planck. Un electrón
escapa del metal solo si el fotón incidente supera la función trabajo $\phi$,
obteniéndose la ecuación del efecto fotoeléctrico:
\begin{equation}
  K_{max} = h\nu - \phi
\end{equation}

\section{Metodología}
\label{method}
Se replica el montaje clásico de tubo fotoeléctrico con filtros de interferencia
de distintas longitudes de onda, midiendo el potencial de frenado para cada una.

\section{Resultados}
\label{results}
La representación de $K_{max}$ en función de $\nu$ produce una recta cuya pendiente
coincide con $h$ dentro del error experimental, confirmando el modelo cuántico.

\section{Conclusiones}
\label{conclusion}
El efecto fotoeléctrico constituye una de las verificaciones fundamentales de la
mecánica cuántica y motivó el desarrollo de la dualidad onda-partícula.

\begin{thebibliography}{9}
\bibitem{einstein1905} A. Einstein, "Über einen die Erzeugung und Verwandlung
des Lichtes betreffenden heuristischen Gesichtspunkt", \emph{Annalen der
Physik}, 1905.
\bibitem{millikan1916} R. A. Millikan, "A Direct Photoelectric Determination of
Planck's h", \emph{Physical Review}, 1916.
\end{thebibliography}
\end{document}`;

const RESULTADOS_TEX = String.raw`\documentclass[journal]{IEEEtran}
\usepackage[spanish]{babel}
\usepackage[utf8]{inputenc}

\begin{document}
\title{Resultados Preliminares}
\author{Usuario Demo}

\maketitle

\section{Datos Experimentales}
Registros del potencial de frenado para longitudes de onda entre 400 nm y 650 nm.

\section{Análisis Pendiente}
Pendiente de la recta $K_{max}$ vs. $\nu$ aún pendiente de ajuste por mínimos
cuadrados con incertidumbre propagada.

\end{document}`;

async function main(): Promise<void> {
  loadEnvFile();

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    logging: false,
    entities: [__dirname + '/../**/*.entity{.js,.ts}'],
    // Igual que la app: garantiza tablas en una BD limpia
    synchronize: true,
  });

  await dataSource.initialize();

  const users = dataSource.getRepository(User);
  const projects = dataSource.getRepository(Project);
  const documents = dataSource.getRepository(LaTeXDocument);
  const conversations = dataSource.getRepository(Conversation);
  const messages = dataSource.getRepository(Message);

  // --- Usuario demo (upsert) ---
  let user = await users.findOne({ where: { email: DEMO_EMAIL } });
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  if (!user) {
    user = await users.save(
      users.create({
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        password: hashedPassword,
        isEmailVerified: true,
        theme: 'dark',
      }),
    );
    console.log(`✔ Usuario demo creado: ${DEMO_EMAIL}`);
  } else {
    user.password = hashedPassword;
    user.isEmailVerified = true;
    await users.save(user);
    console.log(`✔ Usuario demo actualizado: ${DEMO_EMAIL}`);
  }

  // --- Proyecto de ejemplo (solo si no existe ya) ---
  const existingProject = await projects.findOne({
    where: { name: PROJECT_NAME, user: { id: user.id } },
  });

  if (existingProject) {
    console.log('✔ El proyecto de ejemplo ya existe, nada más que hacer.');
    await dataSource.destroy();
    return;
  }

  const project = await projects.save(
    projects.create({
      name: PROJECT_NAME,
      description: PROJECT_DESCRIPTION,
      user,
    }),
  );

  await documents.save([
    documents.create({ title: 'main.tex', content: MAIN_TEX, project }),
    documents.create({
      title: 'resultados_preliminares.tex',
      content: RESULTADOS_TEX,
      project,
    }),
  ]);

  const conversation = await conversations.save(
    conversations.create({
      title: 'Dudas sobre la redacción del abstract',
      project,
    }),
  );

  await messages.save([
    messages.create({
      role: MessageRole.USER,
      content:
        '¿Cómo puedo mejorar el abstract de mi paper sobre el efecto fotoeléctrico?',
      conversation,
    }),
    messages.create({
      role: MessageRole.ASSISTANT,
      content:
        'Tu abstract está bien estructurado, pero puedes hacerlo más conciso. Te sugiero mencionar explícitamente el resultado principal (la verificación experimental de la constante de Planck) en la primera o segunda oración, y evitar fórmulas dentro del abstract. ¿Quieres que lo reescriba?',
      conversation,
    }),
  ]);

  console.log(
    '✔ Proyecto de ejemplo creado con 2 documentos y 1 conversación.',
  );
  await dataSource.destroy();
}

main().catch((err) => {
  console.error('✖ Error ejecutando el seed:', err);
  process.exit(1);
});
