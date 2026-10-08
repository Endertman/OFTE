// Escuela de Primavera UNAB 2026.
// Fuente: horarios oficiales por área (imágenes) + resúmenes de escuela_primavera2026.ods.
// Campos opcionales vacíos se muestran como "Por confirmar".

export type Day = 'Martes 13' | 'Miércoles 14' | 'Jueves 15' | 'Viernes 16';

export type AreaId =
    | 'particulas'
    | 'materia-condensada'
    | 'altas-energias'
    | 'machine-learning'
    | 'astrofisica'
    | 'astronomia';

export interface Area {
    id: AreaId;
    name: string;
    macro: 'Física' | 'Astronomía' | 'Machine Learning';
}

export interface Slot {
    day: Day;
    time: string; // "11:45 - 13:00"
    room: string; // "Sala 502 - R14"
}

export interface Course {
    area: AreaId;
    honorific: string; // "Doctor", "Doctora", "Profesora"
    speaker: string;
    affiliation?: string;
    title?: string;
    abstract?: string;
    link?: string; // materiales del curso
    sessions: Slot[]; // en orden cronológico
}

export interface Plenary {
    n: 'I' | 'II' | 'III';
    honorific: string;
    speaker: string;
    title?: string;
    abstract?: string;
    slot: Slot;
}

export interface CommonBlock {
    day: Day;
    time: string;
    label: string;
    room?: string;
    kind: 'logistica' | 'pausa' | 'actividad';
}

export const event = {
    name: 'Escuela de Primavera UNAB 2026',
    dates: '13 al 16 de octubre de 2026',
    venue: 'Universidad Andrés Bello',
    registrationClosed: true,
};

export const days: Day[] = ['Martes 13', 'Miércoles 14', 'Jueves 15', 'Viernes 16'];

export const areas: Area[] = [
    { id: 'particulas', name: 'Física de Partículas', macro: 'Física' },
    { id: 'materia-condensada', name: 'Materia Condensada', macro: 'Física' },
    { id: 'altas-energias', name: 'Altas Energías', macro: 'Física' },
    { id: 'machine-learning', name: 'Machine Learning', macro: 'Machine Learning' },
    { id: 'astrofisica', name: 'Astrofísica', macro: 'Astronomía' },
    { id: 'astronomia', name: 'Astronomía', macro: 'Astronomía' },
];

export const plenaries: Plenary[] = [
    {
        n: 'I',
        honorific: 'Doctora',
        speaker: 'Claudia Loyola',
        slot: { day: 'Martes 13', time: '10:30 - 11:30', room: 'Auditorio R14' },
    },
    {
        n: 'II',
        honorific: 'Doctora',
        speaker: 'Paola Caprile',
        title: 'Física médica contra el cáncer: de los fundamentos a la frontera de la radioterapia',
        abstract:
            'La radioterapia es una de las principales herramientas para el tratamiento del cáncer y descansa por completo en la física. Esta charla ofrecerá un recorrido por el área, partiendo por los fundamentos de la radioterapia externa y el rol del físico médico en garantizar una entrega de dosis exacta y precisa. A continuación se revisará cómo la inteligencia artificial, que ya generó una revolución en radiología, promete transformar la radioterapia oncológica en cada etapa del flujo de trabajo clínico: segmentación de imágenes, planificación del tratamiento, radioterapia adaptativa y predicción de respuesta y toxicidades. Si bien su potencial para mejorar la precisión, la eficiencia, la personalización y la seguridad es indiscutible, persisten desafíos significativos de disponibilidad de datos, regulación, ética e implementación clínica, que se discutirán con ejemplos concretos. Finalmente se presentará la radioterapia FLASH, una modalidad experimental que al entregar la dosis total de tratamiento en milisegundos parece proteger el tejido sano manteniendo el control tumoral, un efecto cuyo mecanismo sigue en discusión y cuya dosimetría presenta importantes desafíos.',
        slot: { day: 'Miércoles 14', time: '10:30 - 11:30', room: 'Auditorio R14' },
    },
    {
        n: 'III',
        honorific: 'Doctor',
        speaker: 'Marco Ayala',
        title: 'Detectores de luz y su papel en búsquedas de materia oscura.',
        abstract:
            'NA64 es un experimento de blanco activo que utiliza haces de electrones, positrones, muones y hadrones de alta intensidad para investigar física más allá del Modelo Estándar. El haz se genera mediante la colisión de protones del Super Sincrotrón de Protones (SPS) contra un blanco, produciendo una gama de partículas que posteriormente se dirigen al detector NA64. El experimento emplea principalmente la técnica de energía faltante en la búsqueda de materia oscura. En esta charla presentaré cómo el Centro Teórico y Experimental de Física de Partículas (CTEPP) de la UNAB contribuye al programa de física de NA64.',
        slot: { day: 'Jueves 15', time: '09:15 - 10:00', room: 'Auditorio R3' },
    },
];

export const courses: Course[] = [
    {
        area: 'particulas',
        honorific: 'Doctor',
        speaker: 'Yohan Oviedo',
        title: 'Métodos computacionales para buscar nueva física en LHC y futuros colisionadores',
        abstract:
            'En estas lectures se introducirán algunos conceptos fundamentales del Modelo Estándar y se examinará cómo los colisionadores de partículas, desde el Gran Colisionador de Hadrones (LHC) del CERN hasta futuros proyectos como el Future Circular Collider (FCC), permiten explorar la física más allá del Modelo Estándar. Se prestará especial atención al papel de la física computacional en la fenomenología de partículas, así como a diversas herramientas y estrategias de análisis empleadas para identificar posibles señales de nuevas partículas en colisionadores. La discusión presentará dos ejemplos de aplicación. El primero aborda la exploración del espacio de parámetros de un posible bosón cargado W′ através de colisiones ultraperiféricas de iones pesados en el LHC y en el futuro LHC de Alta Luminosidad (HL-LHC). El segundo ejemplo analiza colisiones protón-protón en el FCC con el objetivo de determinar bajo qué condiciones podría observarse un nuevo bosón Z′ o establecer límites sobre su existencia. En conjunto, estas lectures mostrarán cómo la combinación de modelización teórica, técnicas computacionales y datos experimentales contribuye a la búsqueda de nuevos fenómenos y al estudio de las interacciones fundamentales.',
        sessions: [
            { day: 'Martes 13', time: '11:45 - 13:00', room: 'Sala 502 - R14' },
            { day: 'Miércoles 14', time: '15:30 - 16:45', room: 'Sala 502 - R14' },
            { day: 'Jueves 15', time: '10:15 - 11:30', room: 'Sala 210 - R4' },
        ],
    },
    {
        area: 'particulas',
        honorific: 'Doctor',
        speaker: 'Sebastián Olivares',
        title: 'From Theory to Discovery: Particle Physics at Colliders in the Machine Learning Era',
        abstract:
            'This three-lecture course will provide a broad introduction to modern particle physics at high-energy colliders, following the path from theoretical ideas to experimental discovery. We will begin with the foundations of the Standard Model, introducing symmetries, Noether’s theorem, gauge theories, and the particle content of the theory. A simple extension of the Standard Model, such as a dark photon model, will be used to illustrate how new-physics scenarios can be constructed and connected to experimentally testable predictions.\n\nThe second lecture will follow these predictions into the analysis of collider data. We will discuss how a theoretical model is translated into simulated signals, how backgrounds are estimated, and how statistical inference, maximum-likelihood fits, and machine-learning techniques are used to separate signal from background and ultimately constrain or discover new physics.\n\nFinally, we will explore how collider detectors make these measurements possible, from the basic principles of particle detection to the reconstruction of complex collision events. Particular emphasis will be placed throughout the course on the growing role of machine learning in particle physics—where it provides substantial new capabilities, where traditional approaches remain essential, and how these tools are changing the way we search for new phenomena at experiments such as the LHC.',
        sessions: [
            { day: 'Martes 13', time: '14:00 - 15:15', room: 'Sala 502 - R14' },
            { day: 'Miércoles 14', time: '11:45 - 13:00', room: 'Sala 502 - R14' },
            { day: 'Viernes 16', time: '10:15 - 11:30', room: 'Sala 301 - R4' },
        ],
    },
    {
        area: 'particulas',
        honorific: 'Doctor',
        speaker: 'Jeremy Echeverria',
        title: 'Neutrinos y materia oscura: del Modelo Estándar a los modelos escotogénicos',
        abstract:
            'El origen de las masas de los neutrinos y la naturaleza de la materia oscura constituyen dos de las principales preguntas abiertas de la física de partículas. Este minicurso explora los conceptos necesarios para comprender ambos problemas y su posible conexión.\n\nDurante las tres sesiones revisaremos la estructura del Modelo Estándar, el mecanismo de Higgs y las evidencias que motivan su extensión. Introduciremos el problema de la naturaleza de la masa de los neutrinos y la existencia de la materia oscura. Estudiaremos mecanismos para la generación de masas de neutrinos y ejemplos de modelos mínimos de materia oscura. Finalmente, se estudiará el modelo escotogénico como escenario en el que las partículas candidatas a materia oscura generan radiativamente las masas de los neutrinos y su relación con las señales de violación de sabor leptónico.',
        sessions: [
            { day: 'Martes 13', time: '15:30 - 16:45', room: 'Sala 502 - R14' },
            { day: 'Miércoles 14', time: '14:00 - 15:15', room: 'Sala 502 - R14' },
            { day: 'Jueves 15', time: '11:45 - 13:00', room: 'Sala 210 - R4' },
        ],
    },
    {
        area: 'materia-condensada',
        honorific: 'Doctor',
        speaker: 'Mauro Cambiaso',
        sessions: [
            { day: 'Martes 13', time: '11:45 - 13:00', room: 'Sala 405 - R14' },
            { day: 'Miércoles 14', time: '15:30 - 16:45', room: 'Sala 405 - R14' },
            { day: 'Jueves 15', time: '11:45 - 13:00', room: 'Sala 305 - R4' },
        ],
    },
    {
        area: 'materia-condensada',
        honorific: 'Doctor',
        speaker: 'Sergio Davis',
        title: 'Estados metaestables microcanónicos en sólidos simples más allá del punto de fusión',
        abstract:
            'El proceso microscópico que desencadena la fusión de un cristal en condiciones homogéneas es un aspecto de esta transición de fase aún no entendido en detalle. Mediante simulaciones computacionales de dinámica molecular, ha sido posible estudiar sólidos en estados metaestables momentos antes de que ocurra espontáneamente el colapso del cristal. Estos sólidos simulados son preparados en condiciones microcanónicas, esto es, a energía, número de átomos y volumen constantes, parámetros consistente con temperaturas por encima del punto de fusión. Debido a la formación de vacancias térmicas, dichos estados presentan correlaciones no despreciables entre pares de átomos, además de propiedades típicas de sistemas fuera del equilibrio como movimientos cooperativos y difusión anómala.\n\nEn las sesiones de la escuela se revisará el contexto del problema de la fusión homogénea, microcanónica, en modelos simples de sólidos como el cristal de Lennard-Jones, además de las herramientas que la mecánica estadística de sistemas finitos proporciona para su estudio. Se compararán resultados de simulaciones de dinámica molecular realizadas usando el software LAMMPS con las predicciones que hace la mecánica estadística microcanónica de sistemas interactuantes para un número pequeño de grados de libertad, es decir, fuera del límite termodinámico.',
        sessions: [
            { day: 'Martes 13', time: '14:00 - 15:15', room: 'Sala 405 - R14' },
            { day: 'Miércoles 14', time: '11:45 - 13:00', room: 'Sala 405 - R14' },
            { day: 'Jueves 15', time: '10:15 - 11:30', room: 'Sala 305 - R4' },
        ],
    },
    {
        area: 'materia-condensada',
        honorific: 'Doctor',
        speaker: 'Leopoldo Mejía',
        title: 'Transporte Cuántico en Nanoestructuras',
        abstract:
            'En este minicurso se presentará una introducción al transporte electrónico cuántico en sistemas nanoscópicos, con énfasis en el formalismo de funciones de Green fuera del equilibrio (NEGF). A partir de conceptos fundamentales de mecánica cuántica y dispersión, se establecerá la conexión entre transmisión, conductancia y corriente mediante el formalismo de Landauer. Posteriormente, se desarrollará la descripción de dispositivos cuánticos abiertos mediante Hamiltonianos tight-binding, funciones de Green retardadas y avanzadas, autoenergías de los contactos y funciones de ensanchamiento. Estos elementos permitirán derivar e interpretar la expresión de Caroli para la transmisión electrónica y calcular curvas de corriente-voltaje en modelos nanoscópicos.',
        sessions: [
            { day: 'Martes 13', time: '15:30 - 16:45', room: 'Sala 405 - R14' },
            { day: 'Miércoles 14', time: '14:00 - 15:15', room: 'Sala 405 - R14' },
            { day: 'Viernes 16', time: '10:15 - 11:30', room: 'Sala 305 - R4' },
        ],
    },
    {
        area: 'altas-energias',
        honorific: 'Doctor',
        speaker: 'Rodrigo Aros',
        title: 'Espinores en espacios curvados',
        abstract:
            'Comenzando con la ecuación de Dirac en el espacio de Minkowski en coordenadas pseudo-cartesianas, se discutirá cómo se generaliza a  otros sistemas de coordenadas y a espacios curvos. Para realizar lo anterior, se discutirá qué son los espinores en el contexto de la física, así como la introducción de una derivada covariante en el grupo de Lorentz y la generalización de la derivada de Lie a espinores. Se mostrará cómo lo anterior se conecta con la gravitación.\n\nPara finalizar, se discutirá cómo generaliza el concepto de derivada covariante sobre espinores a otros grupos de interes actual en física, como el grupo Conformal de Carroll.',
        sessions: [
            { day: 'Martes 13', time: '11:45 - 13:00', room: 'Sala 404 - R14' },
            { day: 'Miércoles 14', time: '14:00 - 15:15', room: 'Sala 404 - R14' },
            { day: 'Jueves 15', time: '10:15 - 11:30', room: 'Sala 302 - R4' },
        ],
    },
    {
        area: 'altas-energias',
        honorific: 'Doctor',
        speaker: 'Brenno Vallilo',
        title: 'Espacio de fase covariante y cuantización',
        abstract:
            'Este ciclo de charlas presenta una introducción pedagógica al formalismo del espacio de fase covariante para teorías clásicas de campos y a su relación con la cuantización. La idea central es describir el espacio de fase como el espacio de soluciones de las ecuaciones de movimiento, evitando desde el comienzo elegir una foliación espacio-temporal privilegiada. Las clases abordan también las simetrías gauge, las restricciones y la reducción del espacio de fases, con especial atención a las fronteras, las cargas conservadas y los modos de borde. Finalmente, se desarrolla el corchete de Peierls y su conexión con los propagadores retardado y avanzado, la microcausalidad y la cuantización de campos.',
        sessions: [
            { day: 'Martes 13', time: '14:00 - 15:15', room: 'Sala 404 - R14' },
            { day: 'Miércoles 14', time: '11:45 - 13:00', room: 'Sala 404 - R14' },
            { day: 'Viernes 16', time: '10:15 - 11:30', room: 'Sala 303 - R4' },
        ],
    },
    {
        area: 'altas-energias',
        honorific: 'Doctor',
        speaker: 'Alberto Faraggi',
        sessions: [
            { day: 'Martes 13', time: '15:30 - 16:45', room: 'Sala 404 - R14' },
            { day: 'Miércoles 14', time: '15:30 - 16:45', room: 'Sala 404 - R14' },
            { day: 'Jueves 15', time: '11:45 - 13:00', room: 'Sala 302 - R4' },
        ],
    },
    {
        area: 'machine-learning',
        honorific: 'Doctora',
        speaker: 'Pamela Franco',
        affiliation: 'UNAB',
        title: 'IA Interpretable en Neurooncología',
        abstract:
            'Este minicurso ofrece una inmersión teórico-práctica en el análisis de imágenes médicas aplicado a la neurooncología de precisión. A través de notebooks guiados en Python (Google Colab), recorre la formación de imágenes de resonancia magnética en el espacio K, la simulación de secuencias y los mapas paramétricos T1/T2. Luego aborda neuroimagen avanzada (difusión DTI, fMRI y vasculatura TOF-MRA) y culmina con radiómica e Inteligencia Artificial interpretable: extracción de texturas (GLCM), un pipeline de Machine Learning para clasificar el grado tumoral del glioma (LGG vs. HGG) y la interpretación de las predicciones mediante valores SHAP. No requiere instalar software; se recomienda familiaridad básica con Python.',
        link: 'https://github.com/pamelaFranco/workshop_glioma',
        sessions: [
            { day: 'Martes 13', time: '11:45 - 13:00', room: 'Sala 503 - R14' },
            { day: 'Jueves 15', time: '10:15 - 11:30', room: 'Sala 204 - R4' },
            { day: 'Jueves 15', time: '11:45 - 13:00', room: 'Sala 204 - R4' },
        ],
    },
    {
        area: 'machine-learning',
        honorific: 'Doctor',
        speaker: 'Julio Sotelo',
        affiliation: 'USM',
        title: 'Adquisición, reconstrucción y cuantificación en imágenes médicas',
        abstract:
            'Curso 1 (Martes 13 de octubre del 2026 14:00 a 15:15): Adquisición y reconstrucción de imágenes de tomografía computarizada y ultrasonido:  Este curso aborda los principios físicos y tecnológicos fundamentales detrás de la tomografía computarizada (TC) y el ultrasonido (US). Se explorarán en detalle los métodos modernos de adquisición de datos y los algoritmos de reconstrucción de imágenes que permiten transformar las señales físicas en representaciones diagnósticas de alta precisión, destacando además las aplicaciones clínicas, ventajas y limitaciones técnicas de cada modalidad.\n\nCurso 2 (Martes 13 de octubre del 2026 15:30 a 16:45): Adquisición y reconstrucción de imágenes de resonancia magnética: Centrado en la tecnología de resonancia magnética (RM), este espacio profundizará en la compleja física de los campos magnéticos y las ondas de radiofrecuencia utilizadas para la codificación espacial. Se analizarán las principales secuencias de adquisición y las metodologías de reconstrucción matemática y computacional que resultan indispensables para generar imágenes detalladas de alta resolución anatómica y funcional.\n\nCurso 3 (Miércoles 14 de octubre del 2026 15:30 a 16:45): Cuantificación de parametros hemodinámicos a partir de imágenes de 4D flow MRI: Esta sesión está orientada al análisis avanzado del flujo sanguíneo tridimensional mediante la técnica de resonancia magnética 4D Flow. Los asistentes aprenderán los fundamentos para extraer y cuantificar parámetros hemodinámicos críticos, tales como patrones de velocidad, flujo turbulento y fuerzas de cizallamiento, ofreciendo herramientas clave para la investigación y el diagnóstico de patologías cardiovasculares complejas.',
        sessions: [
            { day: 'Martes 13', time: '14:00 - 15:15', room: 'Sala 503 - R14' },
            { day: 'Martes 13', time: '15:30 - 16:45', room: 'Sala 503 - R14' },
            { day: 'Miércoles 14', time: '15:30 - 16:45', room: 'Sala 503 - R14' },
        ],
    },
    {
        area: 'machine-learning',
        honorific: 'Doctor',
        speaker: 'Diego Inostroza',
        title: 'Química computacional y modelos de optimización en espacios moleculares',
        abstract:
            'El minicurso presenta la química computacional como herramienta para predecir y validar propiedades moleculares frente a resultados experimentales. Se revisa el rol de la superficie de energía potencial (PES) en la identificación de estructuras de mínima energía y los desafíos de resolver la ecuación de Schrödinger en sistemas complejos. A partir de ello, se introducen estrategias híbridas de optimización que combinan métodos determinísticos y estocásticos, integrando un autómata celular para generar poblaciones químicamente plausibles.',
        sessions: [
            { day: 'Miércoles 14', time: '11:45 - 13:00', room: 'Sala 503 - R14' },
            { day: 'Miércoles 14', time: '14:00 - 15:15', room: 'Sala 503 - R14' },
            { day: 'Viernes 16', time: '10:15 - 11:30', room: 'Sala 207 - R4' },
        ],
    },
    {
        area: 'astrofisica',
        honorific: 'Profesora',
        speaker: 'Mairym Busnego',
        affiliation: 'UC',
        title: 'Ondas Gravitacionales',
        abstract:
            'En este minicurso veremos cómo la Relatividad General predice las ondas gravitacionales y qué nos dicen sobre los agujeros negros. En la primera clase partiremos de las ecuaciones de Einstein en el régimen de gravedad débil y derivaremos la ecuación de onda que describe cómo se propagan estas perturbaciones del espaciotiempo a la velocidad de la luz. En la segunda clase estudiaremos sus dos polarizaciones, cómo deforman la materia a su paso, cómo las mide un interferómetro como LIGO y cuánta energía transportan. En la tercera clase aplicaremos estas ideas a un agujero negro recién formado. Veremos que, al perturbarlo, vibra como una campana con un conjunto de frecuencias propias, los modos cuasinormales, que dependen solo de su masa y su espín. Esa vibración es el ringdown que se observa al final de una fusión y permite poner a prueba la Relatividad General.',
        sessions: [
            { day: 'Martes 13', time: '11:45 - 13:00', room: 'Sala 504 - R14' },
            { day: 'Martes 13', time: '14:00 - 15:15', room: 'Sala 504 - R14' },
            { day: 'Miércoles 14', time: '15:30 - 16:45', room: 'Sala 504 - R14' },
        ],
    },
    {
        area: 'astrofisica',
        honorific: 'Doctora',
        speaker: 'Celeste Artale',
        affiliation: 'UNAB',
        title: 'Astrofísica de sistemas binarios de objetos compactos en la nueva era de las ondas gravitacionales',
        abstract:
            'Desde la primera detección de ondas gravitacionales el 14 de septiembre de 2015, LIGO, Virgo y KAGRA han catalogado más de un centenar de fusiones de objetos compactos, revelando una población de agujeros negros y estrellas de neutrones con propiedades de masa y espín que desafían nuestra comprensión de la evolución estelar. Este curso ofrece una introducción a la astrofísica de las ondas gravitacionales en tres clases. En la primera clase revisamos el estado del arte observacional de ondas gravitacionales (GWTC-1 a GWTC-5.0) y discutimos los patrones y las preguntas abiertas que surgen de estas detecciones. Luego, en la segunda y la tercera clase, exploramos los canales teóricos de formación que compiten para explicar las propiedades observadas, conversando sobre aspectos fundamentales de la evolución de binarias estelares tanto en regiones aisladas como en ambientes densos. El curso está pensado para estudiantes de pregrado con conocimientos de mecánica newtoniana; no se requiere formación previa en astrofísica estelar.',
        sessions: [
            { day: 'Martes 13', time: '15:30 - 16:45', room: 'Sala 504 - R14' },
            { day: 'Miércoles 14', time: '11:45 - 13:00', room: 'Sala 504 - R14' },
            { day: 'Viernes 16', time: '10:15 - 11:30', room: 'Sala 208 - R4' },
        ],
    },
    {
        area: 'astrofisica',
        honorific: 'Doctora',
        speaker: 'Paola Arias',
        affiliation: 'USM',
        title: 'Introducción a la materia oscura en física de partículas',
        abstract:
            'Cerca del 84% de la materia del universo no emite ni absorbe luz, pero gobierna la formación de galaxias, la dinámica de cúmulos y la estructura del fondo cósmico de microondas. En este minicurso revisaremos, a nivel introductorio pero cuantitativo, la evidencia observacional que sustenta la existencia de la materia oscura y las restricciones que estas observaciones imponen sobre su naturaleza. A partir de un marco cosmológico mínimo  que incluye las ecuaciones de Friedmann y ecuación de Boltzmann, derivaremos la abundancia de reliquia de WIMPs por freeze-out térmico, discutiremos el llamado "WIMP miracle" y contrastaremos este mecanismo con alternativas recientes en voga: freeze-in, producción durante el reheating y producción gravitacional. Dedicaremos la última clase al axión: motivado por el problema CP fuerte de QCD, es el ejemplo paradigmático de materia oscura no térmica producida como condensado coherente vía el mecanismo de desalineamiento. Cerraremos con un panorama breve del programa experimental actual, en especial para las búsquedas de partículas tipo axión.',
        sessions: [
            { day: 'Miércoles 14', time: '14:00 - 15:15', room: 'Sala 504 - R14' },
            { day: 'Jueves 15', time: '10:15 - 11:30', room: 'Sala 206 - R4' },
            { day: 'Jueves 15', time: '11:45 - 13:00', room: 'Sala 206 - R4' },
        ],
    },
    {
        area: 'astronomia',
        honorific: 'Doctora',
        speaker: 'Lucía Guaita',
        sessions: [
            { day: 'Martes 13', time: '11:45 - 13:00', room: 'Sala 505 - R14' },
            { day: 'Martes 13', time: '14:00 - 15:15', room: 'Sala 505 - R14' },
            { day: 'Martes 13', time: '15:30 - 16:45', room: 'Sala 505 - R14' },
        ],
    },
    {
        area: 'astronomia',
        honorific: 'Doctor',
        speaker: 'Bruno Dias',
        title: 'Astrofísica estelar y galáctica',
        abstract:
            'Este mini-curso introduce los conceptos fundamentales de la Astrofísica Estelar y Galáctica,  vinculando los conocimientos de Física y Astronomía con preguntas actuales de  investigación. A lo largo de tres clases, estudiaremos el ciclo de vida de las estrellas y el diagrama de Hertzsprung–Russell, las poblaciones estelares y los cúmulos de estrellas, así como la estructura y evolución de la Vía Láctea y las Nubes de Magallanes. Mediante ejemplos de investigaciones científicas recientes, exploraremos cómo las propiedades de las estrellas permiten investigar la evolución química y dinámica de las galaxias. Finalmente,  discutiremos las nuevas oportunidades que ofrecen los grandes surveys astronómicos, que están recopilando datos de miles de millones de estrellas y transformando nuestra comprensión del Universo. El mini-curso está dirigido a estudiantes de Licenciatura en Física y Astronomía desde segundo año, y busca proporcionar una visión general del área, mostrando cómo los principios físicos fundamentales se aplican a problemas de investigación contemporáneos y abriendo nuevas perspectivas para quienes deseen profundizar en la Astrofísica.',
        sessions: [
            { day: 'Miércoles 14', time: '11:45 - 13:00', room: 'Sala 505 - R14' },
            { day: 'Miércoles 14', time: '14:00 - 15:15', room: 'Sala 505 - R14' },
            { day: 'Miércoles 14', time: '15:30 - 16:45', room: 'Sala 505 - R14' },
        ],
    },
    {
        area: 'astronomia',
        honorific: 'Doctor',
        speaker: 'Raúl Monsalve',
        title: 'Cosmología con la línea de 21 cm: el amanecer cósmico',
        abstract:
            'El modelo estándar de la cosmología se apoya principalmente en observaciones del fondo cósmico de microondas (CMB), emitido a redshift z=1100, y galaxias observadas a z<15. Sin embargo, no existen observaciones del período 1100>z>15, la época en que se formaron las primeras estrellas, galaxias y agujeros negros. En mi presentación, discutiré los intensos esfuerzos actuales para observar este período por primera vez. Las observaciones corresponden a mediciones de la línea espectral de 21 cm del gas de hidrógeno atómico neutro (HI) en el medio intergaláctico (IGM). El HI fue el elemento bariónico más abundante después de la emisión del CMB, y la materia de la cual se formaron los primeros objetos luminosos. Estas mediciones rastrearán la evolución del Universo a grandes escalas espaciales entre la liberación del CMB y el final de la época de reionización a z=5. Así, la señal de 21 cm del HI en el IGM llenará el gran vacío que tenemos en datos y comprensión del Universo temprano. Debido a su sensibilidad a la radiación UV y de rayos X, esta señal establecerá cuándo aparecieron las primeras estrellas y sus propiedades, ofreciendo además un fuerte potencial para sondear física exótica.',
        sessions: [
            { day: 'Jueves 15', time: '10:15 - 11:30', room: 'Sala 209 - R4' },
            { day: 'Jueves 15', time: '11:45 - 13:00', room: 'Sala 209 - R4' },
            { day: 'Viernes 16', time: '10:15 - 11:30', room: 'Sala 212 - R4' },
        ],
    },
];

export const commons: CommonBlock[] = [
    { day: 'Martes 13', time: '09:30 - 10:15', label: 'Inscripciones', room: 'Auditorio R14', kind: 'logistica' },
    { day: 'Martes 13', time: '10:15 - 10:30', label: 'Ceremonia inaugural', room: 'Auditorio R14', kind: 'actividad' },
    { day: 'Martes 13', time: '11:30 - 11:45', label: 'Coffee break', kind: 'pausa' },
    { day: 'Martes 13', time: '13:00 - 14:00', label: 'Almuerzo', kind: 'pausa' },
    { day: 'Martes 13', time: '15:15 - 15:30', label: 'Coffee break', kind: 'pausa' },
    { day: 'Miércoles 14', time: '11:30 - 11:45', label: 'Coffee break', kind: 'pausa' },
    { day: 'Miércoles 14', time: '13:00 - 14:00', label: 'Almuerzo', kind: 'pausa' },
    { day: 'Miércoles 14', time: '15:15 - 15:30', label: 'Coffee break', kind: 'pausa' },
    { day: 'Jueves 15', time: '10:00 - 10:15', label: 'Coffee break', kind: 'pausa' },
    { day: 'Jueves 15', time: '11:30 - 11:45', label: 'Coffee break', kind: 'pausa' },
    { day: 'Jueves 15', time: '13:00 - 14:00', label: 'Almuerzo', kind: 'pausa' },
    { day: 'Jueves 15', time: '14:00 - 15:30', label: 'Charlas de estudiantes', kind: 'actividad' },
    { day: 'Jueves 15', time: '15:40', label: 'Sesión de pósters', room: 'Hall R4, Patio Interior', kind: 'actividad' },
    { day: 'Viernes 16', time: '11:30 - 11:45', label: 'Coffee break', kind: 'pausa' },
    { day: 'Viernes 16', time: '11:45 - 13:00', label: 'Taller de Computación Cuántica I', room: 'Sala COM 302 - R4', kind: 'actividad' },
    { day: 'Viernes 16', time: '13:00 - 14:00', label: 'Almuerzo', kind: 'pausa' },
];
