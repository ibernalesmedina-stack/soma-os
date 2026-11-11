// Generado desde el trabajo de contenidos (precios, textos y SEO de cada tratamiento).
// Para editar textos largos, cambia `contenido` (formato tipo Markdown simple).

export type Precio = { label: string; price: string; desde?: boolean; antes?: string };
export type Tratamiento = {
  slug: string; name: string; sub: string; desc: string; cat: string;
  precios: Precio[]; nota: string; resumen: string; enPortada: boolean;
  seoTitle: string; seoDesc: string; boton: string; notaValor: string[];
  lead: string; contenido: string; img?: string; imgFit?: "contain"; imgBg?: string; relacionados: string[];
};
export type Categoria = { title: string; desc: string; slugs: string[] };

export const TRATAMIENTOS: Record<string, Tratamiento> = {
  "toxina-botulinica": {
    "slug": "toxina-botulinica",
    "name": "Toxina botulínica",
    "sub": "Expresión relajada y natural",
    "desc": "Suaviza líneas de expresión con Dysport, manteniendo un rostro descansado y natural.",
    "cat": "Estética facial",
    "precios": [
      {
        "label": "1 zona",
        "price": "$90.000"
      },
      {
        "label": "3 zonas",
        "price": "$250.000"
      }
    ],
    "nota": "Trabajamos con Dysport®. Valor por tratamiento realizado, independiente de las unidades necesarias.",
    "enPortada": true,
    "seoTitle": "Toxina Botulínica en Concón",
    "seoDesc": "Suaviza líneas de expresión con Dysport, manteniendo un rostro descansado y natural.",
    "boton": "Agendar cita",
    "notaValor": [],
    "lead": "Suaviza las líneas de expresión y recupera una apariencia fresca, descansada y natural.",
    "contenido": "### ¿Qué es?\n\nLa toxina botulínica es un tratamiento estético mínimamente invasivo que permite suavizar las arrugas y líneas de expresión mediante la relajación temporal de determinados músculos faciales.\n\nSu aplicación ayuda a conseguir un rostro de apariencia más descansada y rejuvenecida, manteniendo la expresión y armonía natural de cada persona.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá indicada para personas que desean prevenir o atenuar las líneas de expresión producidas por los movimientos repetitivos del rostro.\n\nSe utiliza principalmente para tratar:\n\n- **Arrugas de la frente:** líneas horizontales que aparecen al levantar las cejas.\n- **Entrecejo:** líneas verticales que se forman al fruncir el ceño.\n- **Patas de gallo:** pequeñas arrugas alrededor de los ojos que aparecen al sonreír.\n\n\nEs una alternativa para quienes buscan una apariencia más fresca y descansada sin recurrir a procedimientos quirúrgicos.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación personalizada para analizar la musculatura facial y determinar los puntos de aplicación según las necesidades de cada paciente.\n\nSe realizan pequeñas inyecciones con agujas muy finas en los músculos seleccionados.\n\n- **Duración:** aproximadamente 15 a 30 minutos, incluyendo la evaluación y preparación.\n- **Anestesia:** generalmente no requiere, aunque puede utilizarse anestesia tópica para mayor comodidad.\n- **Recuperación:** permite retomar la mayoría de las actividades cotidianas inmediatamente.\n\n### Resultados\n\nLos primeros efectos comienzan a observarse entre los **3 y 7 días** posteriores a la aplicación, alcanzando generalmente su resultado máximo alrededor de los 14 días.\n\nLos resultados suelen durar entre **3 y 4 meses**, dependiendo del metabolismo, la musculatura facial y las características individuales de cada paciente.\n\nEl efecto es temporal y puede mantenerse mediante aplicaciones periódicas, según evaluación profesional.\n\n### Cuidados posteriores\n\nPara favorecer una recuperación adecuada, se recomienda:\n\n- Evitar frotar o masajear las zonas tratadas durante las primeras 24 horas.\n- Mantenerse en posición vertical durante las primeras 3 a 4 horas.\n- Evitar el ejercicio físico intenso durante las primeras 24 horas.\n- Evitar tratamientos faciales que impliquen presión o masajes durante las primeras 24 horas.\n- Seguir las indicaciones específicas entregadas por la profesional.\n\nPuede presentarse un leve enrojecimiento, sensibilidad o pequeños hematomas en los puntos de aplicación, que generalmente desaparecen espontáneamente.\n\n### Contraindicaciones\n\nEl tratamiento no está recomendado en determinadas situaciones, entre ellas:\n\n- Embarazo y período de lactancia, por precaución ante la falta de información suficiente sobre su seguridad.\n- Alergia conocida a la toxina botulínica o a alguno de los componentes del producto.\n- Infecciones activas en la zona de aplicación.\n- Enfermedades neuromusculares, como miastenia gravis, que requieren especial evaluación debido al mayor riesgo de efectos adversos.\n- Uso de ciertos medicamentos que puedan interferir con la acción de la toxina botulínica.\n\n**Cada tratamiento requiere una evaluación profesional previa** para determinar si es adecuado y seguro según las características y antecedentes de salud de cada paciente.\n\n### Opciones y valores\n\n:::opciones\n1 zona | $90.000 | Frente, entrecejo o patas de gallo.\n3 zonas | $250.000 | Frente, entrecejo y patas de gallo en un mismo tratamiento.\nMasetero | Consultar | Relaja el músculo de la mandíbula: indicado en bruxismo y para suavizar el contorno mandibular, según evaluación.\nSonrisa gingival | Consultar | Disminuye la exposición de la encía al sonreír, para una sonrisa más armónica.\n:::\n\nTrabajamos con **Dysport®**. El valor es por tratamiento realizado, independiente de la cantidad de unidades que se necesiten.",
    "img": "/tratamiento-botox.jpg",
    "relacionados": [],
    "resumen": "Desde $90.000"
  },
  "acido-hialuronico": {
    "slug": "acido-hialuronico",
    "name": "Ácido hialurónico",
    "sub": "Volumen y armonía facial",
    "desc": "Relleno de alta calidad para restaurar volúmenes, definir contornos y armonizar las proporciones del rostro, siempre respetando tus rasgos.",
    "cat": "Estética facial",
    "precios": [
      {
        "label": "Rinomodelación",
        "price": "$255.000",
        "antes": "$320.000"
      },
      {
        "label": "Aumento de mentón",
        "price": "$240.000"
      },
      {
        "label": "Relleno de pómulos",
        "price": "$240.000"
      },
      {
        "label": "Perfilado o aumento de labios",
        "price": "$235.000"
      },
      {
        "label": "Demarcación mandibular",
        "price": "$450.000"
      }
    ],
    "nota": "",
    "enPortada": true,
    "seoTitle": "Ácido Hialurónico: Armonización Facial",
    "seoDesc": "Realza tus rasgos con ácido hialurónico. Mejora el volumen y contorno facial mediante un tratamiento personalizado y de resultados naturales.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Realza tus rasgos, recupera volumen y resalta tu belleza natural con resultados armónicos y personalizados.",
    "contenido": "### ¿Qué es?\n\nEl ácido hialurónico es una sustancia presente de forma natural en nuestro organismo que ayuda a mantener la hidratación, elasticidad y volumen de la piel.\n\nEn medicina estética, se utiliza en forma de relleno dérmico inyectable para restaurar volúmenes perdidos, mejorar el contorno facial y suavizar determinadas arrugas y surcos.\n\nEs un tratamiento mínimamente invasivo que permite realzar los rasgos del rostro, respetando sus proporciones y expresiones naturales.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá indicado para personas que desean mejorar la armonía facial, recuperar volumen o definir determinadas zonas del rostro sin recurrir a una cirugía.\n\nSus principales aplicaciones incluyen:\n\n- **Labios:** mejorar su hidratación, definición y volumen.\n- **Pómulos:** restaurar volumen y mejorar el contorno facial.\n- **Surcos nasogenianos:** suavizar los pliegues que se forman entre la nariz y las comisuras de los labios.\n- **Mentón:** mejorar su proyección y proporción con el resto del rostro.\n- **Línea mandibular:** aportar definición al contorno inferior del rostro.\n- **Ojeras:** mejorar ciertos hundimientos debajo de los ojos en pacientes seleccionados.\n\nLas zonas de aplicación dependen de la evaluación profesional y del tipo de producto utilizado.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación facial personalizada para identificar las necesidades de cada paciente y definir las zonas de aplicación.\n\nPosteriormente, el ácido hialurónico se administra mediante pequeñas inyecciones con aguja fina o cánula, según el área a tratar.\n\n- **Duración:** aproximadamente 30 a 60 minutos, dependiendo de las zonas tratadas.\n- **Anestesia:** puede utilizarse anestesia tópica o local para mayor comodidad. Algunos productos también contienen lidocaína.\n- **Recuperación:** generalmente permite retomar las actividades cotidianas el mismo día, aunque puede presentarse inflamación o pequeños hematomas.\n\n### Resultados\n\nLos resultados son visibles inmediatamente después de la aplicación, aunque es normal que exista cierta inflamación inicial.\n\nEl resultado puede apreciarse con mayor precisión una vez que disminuye la inflamación, generalmente durante las siguientes **2 a 4 semanas**.\n\nLa duración del tratamiento suele variar entre **6 y 18 meses**, dependiendo de la zona tratada, el tipo de producto y las características individuales de cada paciente.\n\n### Cuidados posteriores\n\nPara favorecer una adecuada recuperación, se recomienda:\n\n- Evitar presionar o masajear la zona tratada, salvo indicación profesional.\n- Evitar el ejercicio físico intenso durante las primeras 24 a 48 horas.\n- Evitar la exposición a calor excesivo, saunas y baños muy calientes durante las primeras 24 a 48 horas.\n- Mantener una adecuada higiene de la zona tratada.\n- Seguir las indicaciones específicas entregadas por la profesional.\n\nEs posible experimentar inflamación, sensibilidad, enrojecimiento o pequeños hematomas, que generalmente desaparecen de forma progresiva.\n\n**Importante:** aunque las complicaciones graves son poco frecuentes, los rellenos pueden provocar una obstrucción vascular. Si aparece dolor intenso o creciente, cambios de coloración de la piel o alteraciones de la visión, se debe buscar atención médica inmediata.\n\n### Contraindicaciones\n\nEl tratamiento puede estar contraindicado o requerir una evaluación especial en las siguientes situaciones:\n\n- Embarazo y lactancia, debido a la falta de evidencia suficiente sobre su seguridad.\n- Alergia conocida a alguno de los componentes del producto.\n- Infecciones o procesos inflamatorios activos en la zona de aplicación.\n- Antecedentes de reacciones alérgicas graves, según el producto utilizado.\n- Trastornos de coagulación o uso de medicamentos anticoagulantes, que requieren evaluación individual.\n\n**Cada paciente debe ser evaluado previamente** para determinar la indicación, el producto y la técnica más adecuados, considerando sus características faciales y antecedentes de salud.",
    "img": "/tratamiento-acido-hialuronico.jpg",
    "relacionados": [],
    "resumen": "Desde $235.000"
  },
  "bioestimuladores": {
    "slug": "bioestimuladores",
    "name": "Bioestimuladores",
    "sub": "Profhilo® y Sculptra®",
    "desc": "Estimulan la regeneración de tu piel para mejorar su firmeza y calidad de forma natural.",
    "cat": "Estética facial",
    "precios": [
      {
        "label": "Profhilo® · 1 jeringa",
        "price": "$250.000"
      },
      {
        "label": "Profhilo® · 2 jeringas",
        "price": "$470.000"
      },
      {
        "label": "Sculptra®",
        "price": "$500.000",
        "antes": "$540.000"
      }
    ],
    "nota": "",
    "enPortada": true,
    "seoTitle": "Bioestimuladores: Profhilo y Sculptra",
    "seoDesc": "Profhilo® y Sculptra® mejoran la firmeza, hidratación y calidad de la piel. Conoce sus diferencias y descubre cuál es el ideal para ti.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Estimula la regeneración de tu piel, mejora su firmeza y recupera una apariencia más joven y natural.",
    "contenido": "### ¿Qué son los bioestimuladores?\n\nLos bioestimuladores son tratamientos estéticos inyectables que ayudan a mejorar la calidad, firmeza y apariencia de la piel, actuando sobre diferentes procesos relacionados con el envejecimiento.\n\nProfhilo® y Sculptra® son dos tratamientos que permiten abordar distintas necesidades de la piel, desde la pérdida de hidratación y elasticidad hasta la disminución de colágeno y volumen facial.\n\n### ¿Para quién están indicados? ¿Qué tratan?\n\nEstán orientados a personas que desean prevenir o mejorar los signos del envejecimiento cutáneo, especialmente la flacidez, pérdida de elasticidad, líneas finas y disminución del volumen facial.\n\n### ¿Cuál es la diferencia entre Profhilo® y Sculptra®?\n\n| Característica | Profhilo® | Sculptra® |\n|---|---|---|\n| Composición | Ácido hialurónico | Ácido poli-L-láctico |\n| Acción principal | Biorremodelación e hidratación de la piel | Estimulación de colágeno |\n| Objetivo | Mejorar hidratación, elasticidad y calidad cutánea | Recuperar progresivamente firmeza, estructura y volumen |\n| Zonas habituales | Rostro y cuello | Zonas específicas del rostro |\n| Sesiones iniciales | Generalmente 2, separadas por 1 mes | Habitualmente 2 a 3, según evaluación |\n| Resultados | Progresivos durante las primeras semanas | Graduales durante los meses siguientes |\n| Duración estimada | Variable; puede requerir mantenimiento a los 6 meses | Hasta 2 años |\n\n### ¿Cómo es el procedimiento?\n\nAmbos tratamientos se realizan mediante pequeñas inyecciones en zonas previamente definidas durante una evaluación personalizada.\n\n- **Duración:** aproximadamente 20 a 60 minutos, según el tratamiento.\n- **Anestesia:** puede utilizarse anestesia tópica o local para mayor comodidad.\n- **Recuperación:** generalmente permiten retomar las actividades cotidianas el mismo día.\n\n### Cuidados posteriores\n\n#### Profhilo®\n\n- Evitar tocar, presionar o masajear las zonas tratadas.\n- Evitar ejercicio intenso durante las primeras 24 horas.\n- Evitar saunas y exposición a calor excesivo durante 24 a 48 horas.\n- Seguir las indicaciones de higiene y cuidado facial entregadas por la profesional.\n\nEs normal presentar pequeñas elevaciones en los puntos de aplicación, leve inflamación o enrojecimiento temporal.\n\n#### Sculptra®\n\n- Realizar masajes durante 5 minutos, 5 veces al día, durante 5 días, siguiendo las indicaciones profesionales.\n- Evitar ejercicio intenso durante las primeras 24 horas.\n- Evitar exposición solar intensa y calor excesivo mientras exista inflamación o enrojecimiento.\n- Aplicar compresas frías si la profesional lo indica.\n\nPuede presentarse inflamación, sensibilidad o pequeños hematomas temporales.\n\n### Contraindicaciones\n\nAmbos tratamientos pueden estar contraindicados o requerir una evaluación especial en casos de:\n\n- Embarazo y lactancia.\n- Alergia a alguno de los componentes del producto.\n- Infecciones o inflamación activa en la zona de aplicación.\n- Determinadas enfermedades autoinmunes o tratamientos inmunosupresores, según evaluación individual.\n- Antecedentes de reacciones adversas a procedimientos inyectables.\n\nAdemás, **Sculptra® no está indicado** en personas con antecedentes de formación de queloides o cicatrices hipertróficas.\n\n**Importante:** aunque son poco frecuentes, las complicaciones de los inyectables pueden ser graves. Dolor intenso, cambios anormales en el color de la piel o alteraciones visuales requieren atención médica inmediata.",
    "img": "/tratamiento-bioestimuladores.jpg",
    "relacionados": [
      "profhilo",
      "sculptra"
    ],
    "resumen": "Desde $250.000"
  },
  "mesoterapia": {
    "slug": "mesoterapia",
    "name": "Mesoterapia",
    "sub": "Hidratación profunda y luminosidad",
    "desc": "Activos revitalizantes que ayudan a hidratar, mejorar la luminosidad y recuperar la calidad natural de tu piel.",
    "cat": "Estética facial",
    "precios": [
      {
        "label": "NCTF 135 · 1 sesión",
        "price": "$105.000",
        "desde": true
      },
      {
        "label": "NCTF 135 · 3 sesiones",
        "price": "$290.000"
      },
      {
        "label": "Pink Glow · 1 sesión",
        "price": "$70.000"
      },
      {
        "label": "Polinucleótidos rostro",
        "price": "$240.000"
      }
    ],
    "nota": "",
    "enPortada": true,
    "seoTitle": "Mesoterapia Facial: Hidratación y Luminosidad",
    "seoDesc": "Mesoterapia facial con NCTF 135 HA, Pink Glow y polinucleótidos para hidratar, dar luminosidad y mejorar la calidad de tu piel.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Hidratación, luminosidad y revitalización para una piel de apariencia más fresca y saludable.",
    "contenido": "### ¿Qué es?\n\nLa mesoterapia facial es un tratamiento estético mínimamente invasivo que consiste en la aplicación de pequeñas microinyecciones de sustancias seleccionadas para mejorar la hidratación, textura y calidad de la piel.\n\nDependiendo del producto utilizado, pueden incorporarse ácido hialurónico, vitaminas, aminoácidos y otros activos que ayudan a revitalizar la piel y mejorar su apariencia.\n\nEs una alternativa para quienes buscan un rostro más luminoso, hidratado y de aspecto descansado, manteniendo resultados naturales.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá orientada a personas que desean mejorar la calidad de su piel, prevenir o atenuar algunos signos del envejecimiento y recuperar su luminosidad.\n\nSus principales beneficios incluyen:\n\n- **Deshidratación:** ayuda a mejorar la hidratación y suavidad de la piel.\n- **Piel opaca:** favorece una apariencia más luminosa y revitalizada.\n- **Líneas finas:** puede contribuir a suavizar su apariencia.\n- **Textura irregular:** ayuda a mejorar la uniformidad y calidad visual de la piel.\n- **Pérdida de elasticidad:** determinados productos pueden favorecer una piel de aspecto más firme.\n\n### Tratamientos disponibles\n\n#### NCTF 135 HA\n\nTratamiento de revitalización cutánea formulado con ácido hialurónico y un complejo de nutrientes, que busca mejorar la hidratación, luminosidad y calidad de la piel.\n\n#### Pink Glow\n\nCóctel de mesoterapia con activos orientados a revitalizar la piel, mejorar su luminosidad y favorecer una apariencia más uniforme.\n\n#### Polinucleótidos\n\nTratamiento inyectable que utiliza polinucleótidos para favorecer la reparación y mejorar progresivamente determinadas características de la calidad cutánea. Su composición, indicaciones y resultados dependen del producto específico utilizado.\n\n#### ¿Cuál es la diferencia?\n\n| Tratamiento | Objetivo principal | Ideal para |\n|---|---|---|\n| NCTF 135 HA | Hidratación y revitalización | Piel deshidratada, opaca y con líneas finas |\n| Pink Glow | Luminosidad y uniformidad del tono | Piel apagada y con tono desigual |\n| Polinucleótidos | Mejorar progresivamente la calidad cutánea | Piel con signos de envejecimiento o pérdida de elasticidad |\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación personalizada para determinar las necesidades de la piel y seleccionar el producto más adecuado.\n\nPosteriormente, se realizan pequeñas microinyecciones superficiales en las zonas seleccionadas.\n\n- **Duración:** aproximadamente 30 a 45 minutos.\n- **Anestesia:** puede utilizarse anestesia tópica para mayor comodidad.\n- **Sesiones:** varían según el producto, el estado de la piel y los objetivos del tratamiento.\n- **Recuperación:** generalmente permite retomar las actividades habituales el mismo día.\n\n### Resultados\n\nLos resultados dependen del producto utilizado y de las características individuales de cada paciente.\n\nLa piel puede comenzar a verse más hidratada y luminosa durante los días o semanas posteriores al procedimiento.\n\nEn algunos casos se recomienda realizar varias sesiones para obtener una mejoría progresiva. La duración de los resultados es variable y puede requerir tratamientos de mantenimiento.\n\n### Cuidados posteriores\n\nPara favorecer una adecuada recuperación, se recomienda:\n\n- Evitar tocar, frotar o masajear las zonas tratadas durante las primeras 24 horas, salvo indicación profesional.\n- Evitar maquillaje durante las primeras 12 a 24 horas, según el procedimiento.\n- Evitar ejercicio físico intenso durante las primeras 24 a 48 horas.\n- Evitar exposición solar directa, saunas y calor excesivo durante las primeras 48 horas.\n- Utilizar protección solar y mantener una rutina de cuidado facial suave.\n- Evitar productos exfoliantes o irritantes hasta que la piel se recupere.\n\nEs normal presentar pequeños puntos de inyección, enrojecimiento, sensibilidad, inflamación leve o pequeños hematomas que suelen desaparecer progresivamente.\n\n### Contraindicaciones\n\nEl tratamiento puede estar contraindicado o requerir especial evaluación en los siguientes casos:\n\n- Embarazo y lactancia, por falta de información suficiente sobre la seguridad de determinados productos.\n- Alergia conocida a alguno de los componentes de la fórmula.\n- Infecciones o inflamaciones activas en la zona de aplicación.\n- Trastornos de coagulación o uso de medicamentos anticoagulantes.\n- Determinadas enfermedades autoinmunes o tratamientos inmunosupresores.\n- Antecedentes de reacciones adversas a tratamientos inyectables.\n\n**Cada paciente requiere una evaluación profesional previa** para determinar el producto y protocolo adecuados según su tipo de piel, objetivos y antecedentes de salud.",
    "img": "/tratamiento-mesoterapia.jpg",
    "relacionados": [],
    "resumen": "Desde $70.000"
  },
  "tratamiento-de-ojeras": {
    "slug": "tratamiento-de-ojeras",
    "name": "Tratamiento de ojeras",
    "sub": "Mirada fresca y descansada",
    "desc": "Mejora la pigmentación, hidratación y calidad de la piel del contorno de ojos.",
    "cat": "Estética facial",
    "precios": [
      {
        "label": "BCN Oculare · 3 sesiones",
        "price": "$310.000"
      },
      {
        "label": "Polinucleótidos contorno de ojos",
        "price": "$250.000"
      }
    ],
    "nota": "",
    "enPortada": true,
    "seoTitle": "Tratamiento de Ojeras",
    "seoDesc": "Mejora tus ojeras con BCN Oculare y polinucleótidos. Tratamientos personalizados para una mirada más luminosa, fresca y descansada.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Una mirada más luminosa, fresca y descansada.",
    "contenido": "Mejora la apariencia de las ojeras, la hidratación y la calidad de la piel del contorno de ojos mediante tratamientos personalizados que ayudan a revitalizar tu mirada, respetando su belleza natural.\n\n### ¿Qué es?\n\nEl tratamiento de ojeras comprende procedimientos estéticos mínimamente invasivos diseñados para mejorar la apariencia y calidad de la piel alrededor de los ojos, una de las zonas más delicadas del rostro.\n\nA través de tratamientos específicos, como BCN Oculare y polinucleótidos, se busca mejorar la hidratación, luminosidad, elasticidad y textura de la piel, ayudando a disminuir determinados signos de cansancio y envejecimiento.\n\nCada tratamiento se selecciona de manera personalizada, considerando las características de la piel y el origen de las ojeras.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá dirigido a personas que desean mejorar el aspecto del contorno de ojos y conseguir una mirada más fresca y descansada.\n\nSus principales objetivos incluyen:\n\n- **Ojeras oscuras:** ayudar a mejorar la apariencia de determinados tipos de pigmentación.\n- **Deshidratación:** favorecer una piel más hidratada y suave.\n- **Líneas finas:** atenuar la apariencia de pequeñas arrugas alrededor de los ojos.\n- **Pérdida de elasticidad:** mejorar progresivamente la calidad y firmeza de la piel.\n- **Aspecto cansado:** revitalizar el contorno de ojos y aportar una apariencia más luminosa.\n\nEs importante considerar que las ojeras pueden tener diferentes causas, como pigmentación, factores vasculares, hundimiento o características anatómicas. Por ello, **no todos los tratamientos son adecuados para todos los tipos de ojeras.**\n\n### Tratamientos disponibles\n\n#### BCN Oculare\n\nTratamiento formulado con activos específicos para el cuidado de la delicada piel del contorno de ojos.\n\nEstá orientado a mejorar la apariencia de las ojeras, favorecer la hidratación y aportar luminosidad, ayudando a conseguir una mirada más fresca y revitalizada.\n\n#### Polinucleótidos para el contorno de ojos\n\nTratamiento estético inyectable que utiliza polinucleótidos para mejorar progresivamente la calidad de la piel periocular.\n\nSu aplicación busca favorecer la hidratación, elasticidad y textura cutánea, contribuyendo a suavizar la apariencia de líneas finas y signos de envejecimiento.\n\n#### ¿Cuál es la diferencia?\n\n| Característica | BCN Oculare | Polinucleótidos |\n|---|---|---|\n| Objetivo principal | Mejorar la apariencia de las ojeras y aportar luminosidad | Mejorar la calidad y elasticidad de la piel |\n| Enfoque | Signos de cansancio y tono apagado | Líneas finas y envejecimiento cutáneo |\n| Resultados | Variables según protocolo | Progresivos |\n| Sesiones | Protocolo de 3 sesiones | Según evaluación profesional |\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación personalizada para identificar las características de las ojeras, analizar la calidad de la piel y seleccionar la alternativa más adecuada.\n\nLa técnica de aplicación depende del producto seleccionado. Los polinucleótidos se administran mediante pequeñas inyecciones en puntos específicos del contorno de ojos, mientras que el procedimiento con BCN Oculare se define según la formulación utilizada.\n\n- **Duración:** aproximadamente 20 a 40 minutos, dependiendo del tratamiento.\n- **Anestesia:** puede utilizarse anestesia tópica cuando el procedimiento lo requiere.\n- **Sesiones:** BCN Oculare se ofrece en un protocolo de 3 sesiones. En el caso de los polinucleótidos, la cantidad de sesiones depende de la evaluación profesional.\n- **Recuperación:** generalmente permite retomar las actividades cotidianas el mismo día.\n\n### Resultados\n\nLos resultados aparecen de manera progresiva y dependen del tratamiento utilizado, las características de la piel y la causa de las ojeras.\n\nLas mejoras en hidratación, luminosidad y textura pueden comenzar a percibirse durante las **primeras semanas**.\n\nEn algunos casos se requiere completar varias sesiones para obtener mejores resultados. La duración de los efectos es variable y puede ser necesario realizar sesiones de mantenimiento según la evolución de cada paciente.\n\n### Cuidados posteriores\n\nPara favorecer una recuperación adecuada, especialmente después de tratamientos inyectables, se recomienda:\n\n- Evitar tocar, frotar o masajear la zona tratada durante las primeras 24 horas, salvo indicación profesional.\n- Evitar aplicar maquillaje en el contorno de ojos durante las primeras 12 a 24 horas, según el procedimiento.\n- Evitar ejercicio físico intenso durante las primeras 24 a 48 horas.\n- Evitar saunas, calor excesivo y exposición solar intensa durante las primeras 48 horas.\n- Utilizar protección solar y mantener una rutina de cuidado facial suave.\n- Seguir las indicaciones específicas entregadas por la profesional.\n\nDespués de un tratamiento inyectable puede presentarse leve inflamación, sensibilidad, enrojecimiento o pequeños hematomas en los puntos de aplicación, que generalmente desaparecen de forma progresiva.\n\n**Importante:** ante dolor intenso, cambios importantes de coloración en la piel o alteraciones visuales, es necesario buscar atención médica inmediata.\n\n### Contraindicaciones\n\nLos tratamientos pueden estar contraindicados o requerir evaluación especial en las siguientes situaciones:\n\n- Embarazo y período de lactancia, por falta de información suficiente sobre la seguridad de determinados productos.\n- Alergia conocida a alguno de los componentes utilizados.\n- Infecciones o inflamaciones activas en la zona de tratamiento.\n- Trastornos de coagulación o uso de medicamentos anticoagulantes.\n- Determinadas enfermedades autoinmunes o tratamientos inmunosupresores.\n- Antecedentes de reacciones adversas a procedimientos estéticos o productos inyectables.\n\n**Cada paciente requiere una evaluación profesional previa** para determinar el tratamiento más adecuado y seguro según sus características y antecedentes de salud.",
    "img": null,
    "relacionados": [],
    "resumen": "Desde $250.000"
  },
  "mesoplastia-de-papada": {
    "slug": "mesoplastia-de-papada",
    "name": "Mesoplastia de papada",
    "sub": "Perfil más definido",
    "desc": "Microinyecciones que reducen la grasa localizada de la papada y definen el contorno del rostro.",
    "cat": "Estética facial",
    "precios": [],
    "nota": "Valor según evaluación clínica y protocolo indicado.",
    "enPortada": true,
    "seoTitle": "Mesoplastia de Papada",
    "seoDesc": "Conoce la mesoplastia de papada, un tratamiento con microinyecciones para reducir grasa localizada y mejorar la definición del contorno facial.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Reduce la grasa localizada bajo el mentón y mejora la definición del contorno facial sin necesidad de cirugía.",
    "contenido": "### ¿Qué es?\n\nLa mesoplastia de papada es un tratamiento estético mínimamente invasivo que utiliza microinyecciones de sustancias lipolíticas para reducir la grasa localizada en la zona submentoniana, conocida comúnmente como papada.\n\nSu objetivo es disminuir el volumen de grasa acumulada debajo del mentón, favoreciendo una apariencia más definida del contorno facial y mejorando la transición entre el rostro y el cuello.\n\nEs una alternativa no quirúrgica para pacientes seleccionados que desean mejorar esta zona sin recurrir a una liposucción.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá orientada a personas que presentan acumulación de grasa localizada bajo el mentón y desean mejorar la definición de su perfil facial.\n\nSus principales objetivos incluyen:\n\n- **Grasa localizada:** reducir el volumen de tejido adiposo acumulado debajo del mentón.\n- **Papada:** mejorar la apariencia del exceso de volumen submentoniano.\n- **Contorno facial:** favorecer una mayor definición de la transición entre el mentón y el cuello.\n- **Perfil facial:** conseguir una apariencia más estilizada y armónica.\n\nEste tratamiento **no está diseñado para bajar de peso ni corregir por sí solo la flacidez importante de la piel.** Por ello, es fundamental realizar una evaluación previa para identificar si la papada se debe principalmente a grasa localizada, flacidez o características anatómicas.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación personalizada para analizar la zona submentoniana, determinar la cantidad y distribución de grasa y establecer si el procedimiento es adecuado.\n\nPosteriormente, se realizan pequeñas inyecciones del producto lipolítico en puntos específicos de la grasa submentoniana.\n\n- **Duración:** aproximadamente 20 a 40 minutos, dependiendo del protocolo.\n- **Anestesia:** puede utilizarse anestesia tópica o local para disminuir las molestias.\n- **Sesiones:** la cantidad y frecuencia dependerán del producto utilizado y de la evaluación profesional.\n- **Recuperación:** generalmente es ambulatoria, aunque la inflamación y sensibilidad pueden afectar temporalmente las actividades habituales.\n\n### Resultados\n\nLos resultados aparecen progresivamente durante las **semanas posteriores** al tratamiento, a medida que el organismo procesa las células grasas tratadas.\n\nDependiendo del producto utilizado, pueden requerirse varias sesiones para obtener el resultado deseado.\n\nCuando se utilizan productos que destruyen las células adiposas, la reducción de grasa conseguida puede ser duradera. Sin embargo, los cambios de peso y el envejecimiento pueden modificar posteriormente el contorno de la zona.\n\nLos resultados varían según las características individuales de cada paciente y el protocolo realizado.\n\n### Cuidados posteriores\n\nPara favorecer una recuperación adecuada, se recomienda:\n\n- Evitar presionar o masajear la zona tratada, salvo indicación profesional.\n- Aplicar compresas frías si la profesional lo recomienda, para ayudar a disminuir las molestias y la inflamación.\n- Evitar ejercicio físico intenso durante las primeras 24 a 48 horas, según la evolución.\n- Evitar saunas, baños muy calientes y exposición a calor excesivo mientras persista la inflamación.\n- Mantener una adecuada higiene de la zona tratada.\n- Seguir las indicaciones específicas entregadas por la profesional.\n\nEs frecuente presentar inflamación, sensibilidad, enrojecimiento, hematomas, endurecimiento o adormecimiento temporal de la zona. La inflamación puede ser considerable y prolongarse durante varios días.\n\nEn algunos casos pueden producirse complicaciones como irregularidades, nódulos, lesiones de la piel o alteraciones nerviosas.\n\n**Importante:** ante dificultad para tragar, asimetría de la sonrisa, debilidad facial, dolor intenso o lesiones en la piel, se debe buscar evaluación médica inmediata.\n\n### Contraindicaciones\n\nEl tratamiento puede estar contraindicado o requerir especial evaluación en las siguientes situaciones:\n\n- Embarazo y período de lactancia, debido a la falta de información suficiente sobre su seguridad.\n- Alergia conocida a alguno de los componentes del producto.\n- Infecciones activas en la zona de aplicación.\n- Antecedentes de dificultad para tragar.\n- Trastornos de coagulación o uso de medicamentos anticoagulantes.\n- Cirugías o tratamientos previos en la zona del mentón y cuello que puedan alterar su anatomía.\n- Flacidez importante u otras características anatómicas que requieran un tratamiento diferente.\n\n**Cada paciente requiere una evaluación clínica previa** para determinar si la mesoplastia de papada es adecuada y establecer un protocolo personalizado.",
    "img": null,
    "relacionados": [],
    "resumen": "Consultar"
  },
  "limpieza-dental": {
    "slug": "limpieza-dental",
    "name": "Limpieza dental",
    "sub": "Salud que se ve y se siente",
    "desc": "Elimina la placa bacteriana, el sarro y las manchas superficiales con una limpieza profesional que ayuda a mantener tus dientes y encías saludables.",
    "cat": "Odontología general",
    "precios": [
      {
        "label": "Limpieza dental",
        "price": "$45.000",
        "desde": true
      }
    ],
    "nota": "El precio final dependerá de la evaluación clínica y del procedimiento indicado.",
    "enPortada": true,
    "seoTitle": "Limpieza Dental Profesional",
    "seoDesc": "Cuida tu sonrisa con una limpieza dental profesional. Elimina sarro, placa bacteriana y manchas superficiales, y mantén tus dientes y encías saludables.",
    "boton": "Agendar cita",
    "notaValor": [],
    "lead": "Cuida tu salud bucal y recupera la frescura natural de tu sonrisa con una limpieza dental profesional.",
    "contenido": "### ¿Qué es?\n\nLa limpieza dental profesional es un procedimiento odontológico preventivo que permite eliminar la placa bacteriana, el sarro y determinadas manchas superficiales acumuladas en los dientes, especialmente en zonas de difícil acceso mediante el cepillado diario.\n\nSu principal objetivo es mantener una adecuada salud bucal, prevenir enfermedades de las encías y favorecer una sonrisa más limpia y saludable.\n\nRealizar limpiezas periódicas, según las necesidades de cada paciente, es fundamental para complementar la higiene oral diaria y detectar oportunamente posibles problemas dentales.\n\n### ¿Para quién es? ¿Qué trata?\n\nLa limpieza dental está indicada para personas que desean mantener una buena salud bucal, prevenir enfermedades y eliminar los depósitos de placa y sarro que no pueden retirarse completamente con el cepillado habitual.\n\nSus principales beneficios incluyen:\n\n- **Eliminación de sarro:** retira los depósitos endurecidos que se acumulan sobre los dientes.\n- **Prevención de gingivitis:** ayuda a disminuir la acumulación de bacterias que provocan inflamación de las encías.\n- **Reducción de manchas superficiales:** elimina determinadas pigmentaciones asociadas al café, té, tabaco y otros hábitos.\n- **Prevención del mal aliento:** contribuye a disminuir las bacterias y depósitos que pueden causar halitosis.\n- **Salud de las encías:** favorece el mantenimiento de tejidos gingivales saludables.\n- **Prevención de enfermedades bucales:** complementa los hábitos de higiene para disminuir el riesgo de problemas dentales y periodontales.\n\nEs un tratamiento preventivo recomendado tanto para quienes presentan acumulación de sarro como para quienes desean mantener su salud bucal en buenas condiciones.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación odontológica para revisar el estado de los dientes y encías e identificar las zonas que requieren mayor atención.\n\nPosteriormente, se realiza la eliminación de placa bacteriana y sarro mediante instrumental especializado, que puede incluir equipos de ultrasonido y herramientas manuales.\n\nDependiendo de las necesidades del paciente, el procedimiento puede complementarse con un pulido dental para eliminar manchas superficiales y mejorar la sensación de limpieza.\n\n- **Duración:** aproximadamente 30 a 60 minutos, según la cantidad de sarro y el estado de salud bucal.\n- **Anestesia:** generalmente no requiere, aunque puede considerarse en pacientes con sensibilidad o necesidades especiales.\n- **Sesiones:** habitualmente se realiza en una sesión.\n- **Recuperación:** permite retomar las actividades cotidianas inmediatamente.\n\nSi durante la evaluación se detecta enfermedad periodontal, puede ser necesario realizar un tratamiento específico de mayor profundidad.\n\n### Resultados\n\nLos resultados son **visibles inmediatamente** después del procedimiento.\n\nLos dientes se sienten más limpios y suaves, mientras que la eliminación de manchas superficiales puede mejorar su apariencia.\n\nLa duración de los resultados depende de los hábitos de higiene oral, la alimentación, el consumo de tabaco y la tendencia individual a acumular placa y sarro.\n\nLa frecuencia de las limpiezas debe determinarse según el riesgo de caries, la salud de las encías y las necesidades de cada paciente. Algunas personas requieren controles más frecuentes que otras.\n\n### Cuidados posteriores\n\nPara mantener los resultados y favorecer una adecuada salud bucal, se recomienda:\n\n- Cepillar los dientes al menos dos veces al día con pasta dental fluorada.\n- Utilizar hilo dental o cepillos interdentales diariamente.\n- Evitar el consumo de tabaco.\n- Moderar el consumo frecuente de alimentos y bebidas que favorecen las manchas dentales.\n- Evitar alimentos y bebidas muy fríos o calientes si aparece sensibilidad temporal.\n- Seguir las indicaciones de higiene oral entregadas por la odontóloga.\n- Asistir a controles odontológicos según la frecuencia recomendada.\n\nDespués del procedimiento puede presentarse una leve sensibilidad dental o sangrado gingival transitorio, especialmente cuando existe inflamación previa de las encías.\n\n### Contraindicaciones y precauciones\n\nLa limpieza dental profesional es un procedimiento generalmente seguro. Sin embargo, existen situaciones que requieren evaluación previa o modificaciones en la técnica utilizada:\n\n- Infecciones orales agudas que requieran tratamiento específico.\n- Enfermedad periodontal avanzada, que puede necesitar un procedimiento de limpieza profunda.\n- Sensibilidad dental importante.\n- Trastornos de coagulación o uso de medicamentos anticoagulantes, que requieren precauciones individualizadas.\n- Determinadas condiciones médicas que exigen adaptar el procedimiento o considerar medidas preventivas adicionales.\n\n**Cada paciente requiere una evaluación odontológica personalizada** para determinar el tipo de limpieza más adecuado según su estado de salud bucal.",
    "img": "/tratamiento-limpieza.jpg",
    "relacionados": [],
    "resumen": "Desde $45.000"
  },
  "blanqueamiento-dental": {
    "slug": "blanqueamiento-dental",
    "name": "Blanqueamiento dental",
    "sub": "Una sonrisa más luminosa",
    "desc": "Protocolo profesional que aclara el tono de tus dientes de forma segura y controlada, con seguimiento personalizado.",
    "cat": "Odontología general",
    "precios": [
      {
        "label": "Blanqueamiento dental",
        "price": "$155.000",
        "desde": true
      }
    ],
    "nota": "El valor final depende del protocolo indicado en la evaluación clínica.",
    "enPortada": true,
    "seoTitle": "Blanqueamiento Dental: Sonrisa más Luminosa",
    "seoDesc": "Blanqueamiento dental profesional en Concón para aclarar el tono de tus dientes de forma segura, controlada y con resultados naturales.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Ilumina tu sonrisa con un tratamiento profesional que ayuda a aclarar el tono de tus dientes de manera segura y controlada.",
    "contenido": "### ¿Qué es?\n\nEl blanqueamiento dental es un tratamiento odontológico estético que permite aclarar el color de los dientes, disminuyendo determinadas manchas y pigmentaciones que aparecen con el paso del tiempo.\n\nSe realiza mediante la aplicación controlada de agentes blanqueadores que actúan sobre los pigmentos presentes en la estructura dental, consiguiendo una sonrisa de aspecto más luminoso y natural.\n\nEs un procedimiento personalizado que busca mejorar la estética de la sonrisa, respetando la salud de los dientes y las encías.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá indicado para personas que desean mejorar el color de sus dientes y conseguir una sonrisa más luminosa.\n\nSus principales objetivos incluyen:\n\n- **Dientes amarillentos:** aclarar el tono dental natural.\n- **Manchas por alimentos y bebidas:** disminuir determinadas pigmentaciones asociadas al consumo de café, té, vino tinto y otros alimentos.\n- **Oscurecimiento por la edad:** mejorar los cambios de color relacionados con el envejecimiento dental.\n- **Alteraciones del color:** tratar ciertos tipos de pigmentaciones, dependiendo de su origen y profundidad.\n- **Estética de la sonrisa:** conseguir una apariencia más uniforme, luminosa y natural.\n\nLos resultados dependen del color inicial de los dientes, el origen de las manchas y las características individuales de cada paciente.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación odontológica para revisar el estado de los dientes y las encías, identificar las causas de las pigmentaciones y determinar el protocolo más adecuado.\n\nDependiendo de las necesidades de cada paciente, puede realizarse mediante **blanqueamiento en clínica**, **blanqueamiento ambulatorio con cubetas personalizadas** o una combinación de ambos.\n\n- **Duración:** las sesiones en clínica suelen durar entre 45 y 90 minutos, según el producto y el protocolo utilizado.\n- **Anestesia:** generalmente no requiere.\n- **Sesiones:** varían según el tono inicial, los objetivos y la técnica seleccionada.\n- **Recuperación:** permite retomar las actividades cotidianas inmediatamente.\n\nAntes de comenzar, pueden ser necesarios otros tratamientos, como una limpieza dental o el manejo de caries y problemas de encías.\n\n### Resultados\n\nLos resultados pueden comenzar a observarse desde la **primera sesión en clínica** o de manera progresiva durante el tratamiento ambulatorio.\n\nEl grado de aclaramiento varía entre pacientes y no es posible garantizar una cantidad específica de tonos.\n\nLos resultados pueden mantenerse durante **varios meses o años**, dependiendo de la higiene oral, los hábitos alimenticios, el consumo de tabaco y las características individuales.\n\nEn algunos casos pueden recomendarse sesiones de mantenimiento para conservar el tono alcanzado.\n\n### Cuidados posteriores\n\nPara mantener los resultados y disminuir las molestias posteriores, se recomienda:\n\n- Mantener una adecuada higiene oral mediante cepillado e higiene interdental.\n- Reducir el consumo frecuente de bebidas y alimentos que puedan producir manchas, como café, té y vino tinto.\n- Evitar el tabaco, ya que favorece la pigmentación dental.\n- Evitar alimentos y bebidas extremadamente fríos o calientes si aparece sensibilidad.\n- Utilizar productos desensibilizantes si son indicados por la odontóloga.\n- Seguir las instrucciones específicas sobre alimentación y uso de productos blanqueadores.\n- Asistir a los controles recomendados para evaluar los resultados.\n\nEs posible presentar sensibilidad dental transitoria o irritación de las encías, molestias que generalmente desaparecen después de finalizar el tratamiento.\n\n### Contraindicaciones\n\nEl blanqueamiento dental puede estar contraindicado o requerir una evaluación especial en los siguientes casos:\n\n- Embarazo y lactancia, por precaución ante la limitada evidencia disponible.\n- Caries activas, problemas periodontales no tratados o lesiones dentales que requieran atención previa.\n- Hipersensibilidad dental importante.\n- Alergia conocida a alguno de los componentes del agente blanqueador.\n- Alteraciones del esmalte o determinadas pigmentaciones que puedan responder de forma limitada al tratamiento.\n- Pacientes menores de edad, según la indicación clínica y normativa aplicable.\n\n**Importante:** las coronas, carillas y restauraciones de resina no se aclaran de la misma manera que los dientes naturales. Por ello, es necesario evaluar previamente la presencia de restauraciones visibles.\n\n**Cada tratamiento requiere una evaluación odontológica personalizada** para determinar su seguridad y la técnica más adecuada.",
    "img": "/tratamiento-blanqueamiento.jpg",
    "relacionados": [],
    "resumen": "Desde $155.000"
  },
  "restauraciones-dentales": {
    "slug": "restauraciones-dentales",
    "name": "Restauraciones dentales",
    "sub": "Estética y función devueltas",
    "desc": "Reparación de piezas dañadas con materiales estéticos de alta resistencia que replican el color y la anatomía natural del diente.",
    "cat": "Odontología general",
    "precios": [],
    "nota": "Valor según evaluación clínica, extensión del daño y tipo de restauración.",
    "enPortada": true,
    "seoTitle": "Restauraciones Dentales",
    "seoDesc": "Repara caries, fracturas y dientes desgastados con restauraciones dentales estéticas. Recupera la función y apariencia natural de tu sonrisa.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Recupera la función, resistencia y estética de tus dientes con restauraciones que respetan la forma y apariencia natural de tu sonrisa.",
    "contenido": "### ¿Qué son?\n\nLas restauraciones dentales son tratamientos odontológicos que permiten reparar dientes afectados por caries, fracturas, desgaste o pérdida de estructura dental.\n\nSu objetivo es recuperar la forma, función y estética del diente mediante materiales restauradores que buscan reproducir su color y anatomía natural.\n\nUno de los materiales más utilizados es la **resina compuesta**, que permite realizar restauraciones estéticas adaptadas a las características de cada paciente, procurando conservar la mayor cantidad posible de estructura dental sana.\n\n### ¿Para quién son? ¿Qué tratan?\n\nLas restauraciones dentales están indicadas para personas que presentan daños en sus dientes y necesitan recuperar su estructura, funcionalidad y apariencia.\n\nSus principales aplicaciones incluyen:\n\n- **Caries dentales:** reparar las zonas afectadas después de eliminar el tejido dañado.\n- **Dientes fracturados:** reconstruir partes del diente que se han quebrado.\n- **Desgaste dental:** recuperar determinadas zonas afectadas por el desgaste.\n- **Alteraciones de forma:** mejorar pequeñas irregularidades en la anatomía dental.\n- **Restauraciones deterioradas:** reemplazar restauraciones antiguas que presentan filtraciones, fracturas u otros defectos clínicamente relevantes.\n\nEl tipo de restauración dependerá de la cantidad de estructura dental comprometida y de las necesidades de cada paciente.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación odontológica para determinar el estado del diente, identificar la causa del daño y seleccionar el material y la técnica de restauración más adecuados.\n\nCuando existe caries, se elimina el tejido afectado y se prepara la superficie dental. Posteriormente, se coloca el material restaurador, que se adapta y modela para recuperar la anatomía y función del diente.\n\nFinalmente, se realizan ajustes de mordida y pulido para conseguir una superficie cómoda y de apariencia natural.\n\n- **Duración:** aproximadamente 30 a 60 minutos por restauración, dependiendo de su tamaño y complejidad.\n- **Anestesia:** puede utilizarse anestesia local cuando el procedimiento lo requiere.\n- **Sesiones:** muchas restauraciones directas pueden completarse en una sola sesión.\n- **Recuperación:** generalmente permite retomar las actividades cotidianas el mismo día.\n\nEn dientes con daño extenso, pueden ser necesarios tratamientos adicionales o restauraciones indirectas.\n\n### Resultados\n\nLos resultados son **visibles inmediatamente** después de finalizar el procedimiento.\n\nEl diente recupera su forma y apariencia, permitiendo mejorar su función masticatoria y estética.\n\nLa duración de una restauración depende del tamaño, material utilizado, ubicación del diente, hábitos de higiene y fuerzas de mordida.\n\nCon un cuidado adecuado y controles periódicos, las restauraciones pueden mantenerse en buenas condiciones durante **varios años**, aunque eventualmente pueden requerir reparación o reemplazo.\n\n### Cuidados posteriores\n\nPara mantener las restauraciones en buenas condiciones, se recomienda:\n\n- Evitar masticar mientras persista el efecto de la anestesia para prevenir mordeduras accidentales.\n- Evitar morder objetos duros, hielo o utilizar los dientes para abrir envases.\n- Mantener una adecuada higiene oral mediante cepillado con pasta fluorada e higiene interdental diaria.\n- Evitar el consumo frecuente de alimentos y bebidas azucaradas para disminuir el riesgo de nuevas caries.\n- Utilizar una férula de protección si existe bruxismo y la odontóloga lo indica.\n- Asistir a controles odontológicos periódicos para evaluar el estado de las restauraciones.\n\nEs posible presentar sensibilidad dental temporal después del procedimiento, especialmente frente a estímulos fríos o calientes.\n\n**Importante:** si aparece dolor persistente, molestias al morder o sensación de que la restauración está demasiado alta, se recomienda solicitar una evaluación.\n\n### Contraindicaciones y precauciones\n\nLas restauraciones dentales son procedimientos habituales y generalmente seguros. Sin embargo, existen situaciones que requieren una evaluación especial:\n\n- **Daño dental extenso:** puede requerir una incrustación, corona u otro tratamiento en lugar de una restauración directa.\n- **Compromiso pulpar:** si el daño alcanza el nervio dental, puede ser necesario realizar un tratamiento de conducto.\n- **Enfermedad periodontal activa:** puede requerir tratamiento previo o complementario.\n- **Bruxismo severo:** puede aumentar el riesgo de desgaste o fractura de las restauraciones.\n- **Alergias a materiales dentales:** deben evaluarse para seleccionar una alternativa adecuada.\n\n**Cada paciente requiere una evaluación odontológica personalizada** para determinar el tratamiento más adecuado y asegurar una restauración funcional, estética y duradera.",
    "img": "/tratamiento-restauraciones.jpg",
    "relacionados": [],
    "resumen": "Consultar"
  },
  "extracciones-dentales": {
    "slug": "extracciones-dentales",
    "name": "Extracciones dentales",
    "sub": "Procedimiento seguro y cuidado",
    "desc": "Extracción realizada con técnica atraumática, anestesia adecuada y acompañamiento en todo el proceso de recuperación.",
    "cat": "Odontología general",
    "precios": [],
    "nota": "Valor según evaluación clínica y complejidad de la extracción.",
    "enPortada": true,
    "seoTitle": "Extracciones Dentales",
    "seoDesc": "Extracciones dentales con anestesia local, técnicas cuidadosas y atención personalizada. Conoce el procedimiento, recuperación y cuidados posteriores.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Cuida tu salud bucal con un procedimiento seguro, planificado y personalizado, priorizando tu comodidad y bienestar durante todo el proceso.",
    "contenido": "### ¿Qué son?\n\nLas extracciones dentales son procedimientos odontológicos que consisten en retirar una pieza dental cuando presenta un daño irreversible o cuando su extracción es necesaria por motivos de salud bucal.\n\nSe realizan mediante técnicas que buscan minimizar el daño a los tejidos circundantes, utilizando anestesia adecuada y cuidados específicos para favorecer una recuperación segura.\n\nSiempre que sea posible, **se prioriza la conservación de los dientes naturales.** La extracción se indica cuando otras alternativas de tratamiento no son viables o resultan insuficientes.\n\n### ¿Para quién son? ¿Qué tratan?\n\nLas extracciones dentales pueden ser necesarias en pacientes que presentan dientes con daño avanzado o determinadas condiciones que afectan su salud bucal.\n\nSus principales indicaciones incluyen:\n\n- **Caries profundas:** cuando el daño dental es tan extenso que la pieza no puede recuperarse mediante otros tratamientos.\n- **Fracturas dentales:** cuando la fractura compromete gravemente la estructura del diente.\n- **Enfermedad periodontal avanzada:** cuando existe una pérdida importante del soporte del diente.\n- **Infecciones dentales:** cuando la pieza no puede conservarse mediante un tratamiento adecuado.\n- **Dientes retenidos o mal posicionados:** en determinados casos donde generan problemas o riesgos para la salud bucal.\n- **Indicaciones ortodóncicas:** cuando la extracción forma parte de un plan de tratamiento previamente evaluado.\n\nLa decisión de extraer un diente se toma después de una evaluación clínica y, cuando corresponde, radiográfica.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación odontológica para revisar el estado de la pieza dental, sus raíces y los tejidos que la rodean.\n\nDependiendo de la complejidad, puede ser necesaria una radiografía para planificar el procedimiento.\n\nPosteriormente, se administra anestesia local y se realiza la extracción mediante instrumental y técnicas adecuadas para minimizar el trauma de los tejidos.\n\n- **Duración:** aproximadamente 20 a 60 minutos, dependiendo de la complejidad del caso.\n- **Anestesia:** se utiliza anestesia local para controlar el dolor durante el procedimiento.\n- **Sesiones:** generalmente se realiza en una sesión, aunque pueden requerirse controles posteriores.\n- **Recuperación:** las actividades habituales suelen retomarse progresivamente durante los días siguientes, dependiendo del tipo de extracción.\n\nLas extracciones complejas, como algunas muelas del juicio retenidas, pueden requerir una intervención quirúrgica especializada.\n\n### ¿Cómo es la recuperación?\n\nDurante las **primeras 24 a 72 horas** es habitual experimentar inflamación, sensibilidad o molestias leves a moderadas en la zona tratada.\n\nLa encía comienza a cicatrizar durante los primeros días, mientras que la recuperación completa de los tejidos puede tomar varias semanas.\n\nEl tiempo de recuperación depende de la complejidad de la extracción, el estado de salud del paciente y el cumplimiento de los cuidados posteriores.\n\nUna parte fundamental del proceso es la formación y conservación del **coágulo sanguíneo**, que protege la zona y permite una cicatrización adecuada.\n\n### Cuidados posteriores\n\nPara favorecer una recuperación adecuada y prevenir complicaciones, se recomienda:\n\n- **Mantener una gasa con presión suave y constante** durante el tiempo indicado por la odontóloga para controlar el sangrado.\n- **No enjuagarse enérgicamente, escupir ni utilizar bombillas** durante las primeras 24 horas, para evitar desplazar el coágulo.\n- Evitar fumar o vapear durante la cicatrización, especialmente durante las primeras 72 horas.\n- Evitar ejercicio físico intenso durante las primeras 24 a 48 horas.\n- Consumir alimentos blandos y preferentemente fríos o tibios durante los primeros días.\n- Evitar alimentos muy calientes, duros o que puedan irritar la zona tratada.\n- Aplicar compresas frías externamente si la profesional lo indica, para ayudar a controlar la inflamación.\n- Mantener una adecuada higiene bucal, evitando cepillar directamente el sitio de extracción durante las primeras 24 horas.\n- Tomar únicamente los medicamentos indicados por la profesional.\n\nDespués de las primeras 24 horas, pueden recomendarse enjuagues suaves con agua tibia y sal, según las indicaciones recibidas.\n\nEs normal presentar un leve sangrado inicial, inflamación y molestias temporales.\n\n**Importante:** si aparece sangrado abundante que no cede con presión, fiebre, inflamación que empeora, dolor intenso que aumenta después de los primeros días o dificultad para respirar o tragar, se debe buscar atención profesional urgente.\n\n### Contraindicaciones y precauciones\n\nLas extracciones dentales requieren una evaluación previa, especialmente cuando existen condiciones que pueden aumentar los riesgos del procedimiento.\n\nEntre ellas se encuentran:\n\n- **Trastornos de coagulación:** pueden aumentar el riesgo de sangrado.\n- **Uso de anticoagulantes:** requiere evaluación y planificación individualizada. No deben suspenderse sin indicación médica.\n- **Diabetes no controlada:** puede aumentar el riesgo de infección y dificultar la cicatrización.\n- **Enfermedades cardiovasculares:** algunas condiciones requieren precauciones especiales.\n- **Uso de medicamentos antirresortivos:** como ciertos tratamientos para osteoporosis o cáncer, debido al riesgo de complicaciones óseas.\n- **Infecciones o enfermedades sistémicas relevantes:** pueden requerir medidas adicionales o coordinación con el médico tratante.\n\nEl embarazo no constituye por sí mismo una contraindicación para una extracción dental necesaria, pero requiere una planificación adecuada.\n\n**Cada procedimiento debe ser evaluado individualmente**, considerando los antecedentes de salud, la complejidad del caso y las alternativas de tratamiento disponibles.",
    "img": "/tratamiento-extracciones.jpg",
    "relacionados": [],
    "resumen": "Consultar"
  },
  "protesis-dentales": {
    "slug": "protesis-dentales",
    "name": "Prótesis dentales",
    "sub": "Recuperar la mordida y la sonrisa",
    "desc": "Prótesis diseñadas a medida para devolver función masticatoria, soporte facial y estética.",
    "cat": "Odontología general",
    "precios": [
      {
        "label": "Prótesis dental",
        "price": "$285.000",
        "desde": true
      }
    ],
    "nota": "Posibilidad de reembolso Fonasa, sujeta a condiciones de cobertura. Valor final según tipo de prótesis, materiales y complejidad.",
    "enPortada": true,
    "seoTitle": "Prótesis Dentales",
    "seoDesc": "Recupera tu sonrisa con prótesis dentales personalizadas. Mejora tu masticación, comodidad y estética. Agenda tu evaluación con la Dra. Paola Cárdenas.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Recupera la funcionalidad, estética y armonía de tu sonrisa con prótesis dentales diseñadas especialmente para ti.",
    "contenido": "### ¿Qué son?\n\nLas prótesis dentales son dispositivos odontológicos diseñados para reemplazar uno o varios dientes perdidos, permitiendo recuperar la función masticatoria, mejorar la estética de la sonrisa y favorecer el soporte de los tejidos faciales.\n\nSe elaboran de manera personalizada, considerando la anatomía bucal, las necesidades funcionales y las características estéticas de cada paciente.\n\nSu objetivo es devolver comodidad y confianza al sonreír, hablar y comer, contribuyendo a mejorar la calidad de vida y la salud bucal.\n\n### ¿Para quién son? ¿Qué tratan?\n\nEstán indicadas para personas que han perdido una o varias piezas dentales y desean recuperar la funcionalidad y apariencia de su sonrisa.\n\nSus principales beneficios incluyen:\n\n- **Pérdida de dientes:** reemplazar piezas ausentes de manera funcional y estética.\n- **Masticación:** mejorar la capacidad para masticar los alimentos.\n- **Estética dental:** recuperar la apariencia y armonía de la sonrisa.\n- **Soporte facial:** contribuir a mantener el soporte de labios y mejillas, según el tipo de prótesis.\n- **Fonética:** ayudar a mejorar la pronunciación de determinados sonidos afectados por la ausencia dental.\n- **Confianza:** favorecer la seguridad al sonreír, hablar y compartir con otras personas.\n\nEl tipo de prótesis dependerá de la cantidad de dientes ausentes, el estado de las encías, el soporte óseo y las necesidades individuales del paciente.\n\n### Tipos de prótesis dentales\n\n#### Prótesis removibles parciales\n\nPermiten reemplazar uno o varios dientes ausentes cuando el paciente aún conserva algunas piezas dentales naturales. Pueden retirarse para facilitar su higiene y mantenimiento.\n\n#### Prótesis removibles totales\n\nEstán diseñadas para reemplazar todos los dientes de una arcada superior o inferior. Buscan recuperar la función masticatoria, la estética y el soporte de los tejidos faciales.\n\n#### Prótesis fijas\n\nSon restauraciones que reemplazan dientes ausentes o rehabilitan piezas dañadas y permanecen instaladas en la boca. Pueden apoyarse en dientes naturales o implantes, dependiendo del caso.\n\nLa indicación de cada alternativa se determina mediante una evaluación odontológica personalizada.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación clínica para analizar el estado de los dientes, encías y estructuras de soporte.\n\nPosteriormente, se realizan registros, impresiones o escaneos digitales, según la técnica utilizada, para diseñar una prótesis adaptada a la anatomía de cada paciente.\n\nDurante el proceso pueden realizarse pruebas de ajuste, mordida y estética antes de la entrega definitiva.\n\n- **Duración:** varía según el tipo de prótesis y la complejidad del caso.\n- **Anestesia:** generalmente no se requiere para la toma de impresiones y las pruebas de prótesis removibles, aunque algunos procedimientos complementarios pueden necesitarla.\n- **Sesiones:** habitualmente se requieren varias citas para evaluación, confección, pruebas y ajustes.\n- **Recuperación:** puede existir un período de adaptación, especialmente con las prótesis removibles.\n\nUna vez instalada la prótesis, se entregan indicaciones de uso, higiene y mantenimiento.\n\n### Resultados\n\nLos resultados funcionales y estéticos comienzan a apreciarse **desde la instalación** de la prótesis.\n\nDurante las primeras semanas puede ser necesario un período de adaptación para acostumbrarse a hablar, masticar y utilizarla con comodidad.\n\nLa duración depende del tipo de prótesis, los materiales, los hábitos de higiene, el estado de los tejidos de soporte y los controles odontológicos.\n\nCon un cuidado adecuado, las prótesis pueden mantenerse funcionales durante **varios años**, aunque pueden requerir ajustes, reparaciones o reemplazos debido al desgaste y los cambios naturales de la boca.\n\n### Cuidados posteriores\n\nPara mantener una prótesis dental en buenas condiciones, se recomienda:\n\n- **Higiene diaria:** limpiar la prótesis siguiendo las indicaciones de la odontóloga y utilizando productos adecuados para su material.\n- **Cuidado de las encías:** mantener una adecuada higiene de los tejidos bucales y de los dientes naturales que permanezcan.\n- **Adaptación progresiva:** comenzar con alimentos blandos y avanzar gradualmente hacia una alimentación habitual.\n- **Evitar alimentos muy duros o pegajosos:** especialmente durante el período inicial de adaptación.\n- **Retirar las prótesis removibles durante la noche:** salvo que la odontóloga indique lo contrario.\n- **Conservación adecuada:** guardar las prótesis removibles según las recomendaciones para evitar deformaciones o daños.\n- **Controles periódicos:** asistir a las evaluaciones para revisar el ajuste y estado de la prótesis.\n\nLas prótesis removibles deben limpiarse diariamente con productos no abrasivos. No deben utilizarse agua hirviendo ni sustancias que puedan deteriorar sus materiales.\n\nEs posible experimentar aumento de saliva, pequeñas molestias o dificultades iniciales para hablar y masticar mientras ocurre la adaptación.\n\n**Importante:** si aparecen heridas, dolor persistente o movilidad excesiva de la prótesis, es importante solicitar una evaluación para realizar los ajustes necesarios.\n\n### Contraindicaciones y precauciones\n\nLas prótesis dentales son una alternativa de rehabilitación para muchas personas. Sin embargo, existen situaciones que requieren evaluación o tratamiento previo:\n\n- **Enfermedad periodontal activa:** puede ser necesario tratar las encías antes de iniciar la rehabilitación.\n- **Caries o infecciones dentales:** requieren atención para asegurar condiciones bucales adecuadas.\n- **Pérdida importante de soporte óseo:** puede dificultar la estabilidad de determinadas prótesis.\n- **Alteraciones de la mordida:** pueden requerir planificación y ajustes especiales.\n- **Bruxismo:** puede aumentar el desgaste o riesgo de fractura de algunos materiales.\n- **Alergias a materiales dentales:** deben considerarse para seleccionar una alternativa adecuada.\n\n**Cada paciente requiere una evaluación odontológica personalizada** para determinar el tipo de prótesis más adecuado, considerando la salud bucal, la funcionalidad y los objetivos estéticos.",
    "img": "/tratamiento-protesis.jpg",
    "relacionados": [],
    "resumen": "Desde $285.000"
  },
  "implante-dental-unitario": {
    "slug": "implante-dental-unitario",
    "name": "Implante unitario",
    "sub": "Una pieza, resultado natural",
    "desc": "Reemplaza un diente perdido mediante un implante de titanio y una corona personalizada, recuperando la función masticatoria y la estética natural de tu sonrisa.",
    "cat": "Implantología",
    "precios": [
      {
        "label": "Implante unitario",
        "price": "$700.000",
        "desde": true
      }
    ],
    "nota": "",
    "enPortada": true,
    "seoTitle": "Implante Dental Unitario",
    "seoDesc": "Reemplaza un diente perdido con un implante dental unitario y una corona personalizada. Recupera la función y estética de tu sonrisa. Agenda tu evaluación.",
    "boton": "Agendar evaluación",
    "notaValor": [
      "El valor final dependerá de la evaluación clínica, los materiales utilizados y la complejidad del procedimiento.",
      "En la evaluación se confirma si el presupuesto incluye el implante, el pilar, la corona definitiva y los procedimientos complementarios que pudieran requerirse."
    ],
    "lead": "Recupera tu sonrisa con una solución fija, funcional y estética, diseñada para reemplazar un diente perdido de manera natural.",
    "contenido": "### ¿Qué es?\n\nEl implante dental unitario es un tratamiento odontológico que permite reemplazar una pieza dental perdida mediante la colocación de un implante, generalmente de titanio, que actúa como una raíz artificial sobre la cual se instala una corona personalizada.\n\nSu objetivo es recuperar la función masticatoria, la estética y la armonía de la sonrisa, ofreciendo una alternativa fija que se integra funcionalmente con los dientes naturales.\n\nUna de sus principales ventajas es que, a diferencia de algunos puentes dentales tradicionales, permite reemplazar un diente **sin necesidad de desgastar las piezas vecinas sanas.**\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá indicado para personas que han perdido una pieza dental y desean recuperar su función y apariencia mediante una solución fija.\n\nSus principales beneficios incluyen:\n\n- **Pérdida de un diente:** reemplaza una pieza ausente sin depender necesariamente de los dientes vecinos.\n- **Función masticatoria:** permite recuperar la capacidad de masticar de manera cómoda y eficiente.\n- **Estética dental:** restaura la apariencia de la sonrisa mediante una corona diseñada según el color, forma y tamaño de los dientes naturales.\n- **Estabilidad:** proporciona una alternativa fija que no necesita retirarse para su limpieza.\n- **Conservación ósea:** puede ayudar a limitar la pérdida de hueso asociada a la ausencia de un diente.\n- **Armonía de la sonrisa:** permite recuperar la continuidad y proporción de la arcada dental.\n\nPara realizar el tratamiento es necesario contar con condiciones adecuadas de salud bucal y soporte óseo, que se evalúan individualmente.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación odontológica para analizar el estado de las encías, la cantidad y calidad del hueso disponible y las condiciones generales de salud.\n\nSe realizan estudios de imagen, que pueden incluir una tomografía dental, para planificar la posición del implante.\n\nEl procedimiento se desarrolla habitualmente en las siguientes etapas:\n\n#### 1. Evaluación y planificación\n\nSe estudia la anatomía del paciente y se diseña un plan de tratamiento personalizado.\n\n#### 2. Colocación del implante\n\nMediante un procedimiento quirúrgico con anestesia local, se instala el implante en el hueso maxilar o mandibular.\n\n#### 3. Osteointegración\n\nDurante los meses siguientes, el implante se integra progresivamente con el hueso, proporcionando una base estable para la futura corona.\n\n#### 4. Instalación de la corona\n\nUna vez que existen las condiciones adecuadas, se instala una corona personalizada que reproduce la forma, función y apariencia del diente perdido.\n\n- **Duración de la cirugía:** aproximadamente 30 a 90 minutos, dependiendo de la complejidad del caso.\n- **Anestesia:** se utiliza anestesia local para controlar el dolor durante el procedimiento.\n- **Sesiones:** requiere varias citas para planificación, cirugía, controles y rehabilitación.\n- **Recuperación:** las molestias iniciales suelen disminuir durante los primeros días, mientras que la integración del implante con el hueso requiere más tiempo.\n\nEn algunos casos puede ser necesario realizar procedimientos adicionales, como injertos óseos, antes o durante la colocación del implante.\n\n### Resultados\n\nEl resultado estético definitivo se aprecia una vez instalada la corona dental.\n\nEl proceso completo puede durar varios meses, ya que habitualmente se requiere un período de osteointegración de aproximadamente **3 a 6 meses**, aunque este plazo puede variar según las condiciones óseas y el protocolo utilizado.\n\nEn determinados casos es posible instalar una restauración provisional antes de finalizar la integración del implante.\n\nLos implantes dentales están diseñados para ofrecer una solución de larga duración. Con una adecuada higiene, controles periódicos y condiciones de salud favorables, pueden mantenerse funcionales durante **muchos años**.\n\nSin embargo, su permanencia no está garantizada y la corona puede requerir mantenimiento o reemplazo con el tiempo.\n\n### Cuidados posteriores\n\nPara favorecer una recuperación adecuada y mantener la salud del implante, se recomienda:\n\n- **Mantener una higiene bucal cuidadosa:** seguir las indicaciones de limpieza entregadas por la profesional, evitando traumatizar la zona intervenida durante los primeros días.\n- **Evitar fumar o vapear:** el tabaco aumenta el riesgo de complicaciones y puede afectar la cicatrización y la integración del implante.\n- **Consumir alimentos blandos:** durante los primeros días, evitando masticar directamente sobre la zona intervenida.\n- **Evitar ejercicio físico intenso:** durante las primeras 24 a 48 horas o según indicación profesional.\n- **No manipular la zona quirúrgica:** evitar tocar la herida con los dedos o la lengua.\n- **Seguir el tratamiento indicado:** utilizar los medicamentos y productos de higiene únicamente según las instrucciones recibidas.\n- **Asistir a controles periódicos:** para evaluar la cicatrización, estabilidad del implante y salud de los tejidos que lo rodean.\n\nDurante los primeros días pueden presentarse inflamación, sensibilidad, molestias o pequeños hematomas, que generalmente disminuyen progresivamente.\n\nUna vez finalizada la rehabilitación, es fundamental mantener una adecuada higiene oral y asistir a controles para prevenir enfermedades periimplantarias.\n\n**Importante:** ante sangrado persistente, fiebre, secreción, dolor que aumenta o movilidad del implante, se debe solicitar una evaluación profesional.\n\n### Contraindicaciones y precauciones\n\nEl tratamiento con implantes dentales requiere una evaluación individualizada, especialmente en personas que presentan condiciones que pueden afectar la cicatrización o la estabilidad del implante.\n\nEntre ellas se encuentran:\n\n- **Enfermedad periodontal activa:** debe tratarse y controlarse antes de la rehabilitación.\n- **Diabetes no controlada:** puede aumentar el riesgo de infección y complicaciones durante la cicatrización.\n- **Tabaquismo:** incrementa el riesgo de fracaso del implante y enfermedades periimplantarias.\n- **Insuficiente soporte óseo:** puede requerir procedimientos adicionales o alternativas de tratamiento.\n- **Bruxismo:** puede generar sobrecargas que requieren planificación y protección específicas.\n- **Uso de ciertos medicamentos:** especialmente algunos tratamientos antirresortivos utilizados para osteoporosis o cáncer, que requieren una evaluación cuidadosa.\n- **Enfermedades sistémicas o tratamientos que alteran la cicatrización:** pueden requerir coordinación con el médico tratante.\n\nEl embarazo, algunas condiciones médicas no controladas y determinados tratamientos farmacológicos pueden hacer recomendable postergar una cirugía electiva.\n\n**Cada paciente requiere una evaluación clínica y radiográfica previa** para determinar si el tratamiento es adecuado y planificarlo de manera segura.",
    "img": "/tratamiento-implante-unitario.jpg",
    "relacionados": [],
    "resumen": "Desde $700.000"
  },
  "rehabilitacion-sobre-implantes": {
    "slug": "rehabilitacion-sobre-implantes",
    "name": "Rehabilitación completa sobre implantes",
    "sub": "Toda la sonrisa, en un plan",
    "desc": "Tratamiento integral que restaura la arcada completa, recuperando mordida, soporte facial y confianza al sonreír.",
    "cat": "Implantología",
    "precios": [
      {
        "label": "Sobredentadura",
        "price": "$2.100.000",
        "desde": true
      },
      {
        "label": "Prótesis total fija",
        "price": "$3.990.000",
        "desde": true
      }
    ],
    "nota": "",
    "enPortada": true,
    "seoTitle": "Rehabilitación sobre Implantes",
    "seoDesc": "Recupera tu sonrisa con rehabilitación completa sobre implantes. Conoce las sobredentaduras y prótesis fijas para mejorar tu comodidad y función dental.",
    "boton": "Agendar evaluación",
    "notaValor": [
      "Los valores pueden variar según la evaluación clínica, el número de implantes, los materiales utilizados y los procedimientos adicionales necesarios."
    ],
    "lead": "Recupera la funcionalidad, estética y confianza de tu sonrisa con una rehabilitación dental diseñada especialmente para ti.",
    "contenido": "### ¿Qué es?\n\nLa rehabilitación completa sobre implantes es un tratamiento odontológico que permite reemplazar todos los dientes de una arcada superior o inferior mediante una prótesis sostenida por implantes dentales.\n\nLos implantes se colocan en el hueso maxilar o mandibular y funcionan como puntos de soporte para una rehabilitación personalizada, proporcionando **mayor estabilidad y funcionalidad** que una prótesis convencional sin anclaje a implantes.\n\nSu objetivo es recuperar la capacidad masticatoria, mejorar la estética de la sonrisa y favorecer el soporte de los tejidos faciales, contribuyendo a una mejor calidad de vida.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá indicada para personas que han perdido todos o la mayoría de sus dientes, o que presentan piezas dentales con un pronóstico desfavorable y requieren una rehabilitación integral.\n\nSus principales beneficios incluyen:\n\n- **Pérdida dental extensa:** permite reemplazar todos los dientes de una arcada.\n- **Función masticatoria:** favorece una masticación más cómoda y eficiente.\n- **Estabilidad:** proporciona mayor sujeción de la prótesis mediante implantes dentales.\n- **Estética de la sonrisa:** recupera la apariencia y proporciones de los dientes.\n- **Soporte facial:** puede mejorar el soporte de los labios y tejidos faciales.\n- **Comodidad:** puede disminuir el movimiento de las prótesis durante el habla y la alimentación.\n- **Confianza:** contribuye a recuperar la seguridad al sonreír y realizar actividades cotidianas.\n\nEl tratamiento se planifica de forma individual, considerando las condiciones óseas, la salud bucal y las necesidades funcionales y estéticas de cada paciente.\n\n### Tipos de rehabilitación sobre implantes\n\n#### Sobredentadura sobre implantes\n\nEs una prótesis removible que se fija a implantes dentales mediante sistemas de retención especiales.\n\nOfrece mayor estabilidad que una prótesis removible convencional y permite que el paciente la retire para realizar su higiene diaria.\n\nEs una alternativa para quienes buscan mejorar la retención y comodidad de su prótesis, especialmente cuando una dentadura convencional presenta movilidad o dificultades de adaptación.\n\n#### Prótesis total fija sobre implantes\n\nEs una rehabilitación que reemplaza todos los dientes de una arcada mediante una estructura protésica fijada a varios implantes dentales.\n\nA diferencia de la sobredentadura, no está diseñada para ser retirada diariamente por el paciente.\n\nSu principal ventaja es proporcionar una solución fija, estable y de apariencia natural, que permite recuperar la función masticatoria y la estética dental.\n\n#### ¿Cuál es la diferencia?\n\n| Característica | Sobredentadura | Prótesis total fija |\n|---|---|---|\n| Tipo de prótesis | Removible | Fija |\n| Soporte | Implantes y, según el diseño, tejidos de soporte | Implantes dentales |\n| Estabilidad | Mayor que una prótesis convencional | Generalmente elevada |\n| Retiro | El paciente puede retirarla | Se retira profesionalmente cuando es necesario |\n| Higiene | Se retira para su limpieza | Se limpia en boca con técnicas especiales |\n| Objetivo | Mejorar retención y comodidad | Rehabilitación fija de una arcada completa |\n\nLa selección dependerá de la cantidad y distribución del hueso disponible, el número de implantes, el diseño protésico y las necesidades individuales.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación clínica y radiográfica para analizar las condiciones del hueso, las encías y las estructuras bucales.\n\nHabitualmente se utilizan estudios de imagen, como una tomografía dental, para planificar la ubicación de los implantes y el diseño de la futura prótesis.\n\nEl procedimiento se desarrolla en distintas etapas:\n\n#### 1. Evaluación y planificación\n\nSe estudian las condiciones bucales, se identifican las necesidades del paciente y se establece un plan de rehabilitación personalizado.\n\n#### 2. Colocación de implantes\n\nMediante un procedimiento quirúrgico con anestesia local, se instalan los implantes en el hueso maxilar o mandibular.\n\n#### 3. Osteointegración\n\nDurante los meses siguientes, los implantes se integran progresivamente con el hueso, proporcionando soporte para la rehabilitación.\n\n#### 4. Confección de la prótesis\n\nSe realizan registros, pruebas de mordida y evaluaciones estéticas para diseñar una prótesis adaptada al paciente.\n\n#### 5. Instalación y controles\n\nUna vez reunidas las condiciones necesarias, se instala la prótesis definitiva y se realizan los ajustes correspondientes para mejorar su comodidad y funcionamiento.\n\n- **Duración:** depende del número de implantes y de la complejidad del tratamiento.\n- **Anestesia:** generalmente se utiliza anestesia local para la etapa quirúrgica.\n- **Sesiones:** se requieren varias citas para planificación, cirugía, confección protésica y controles.\n- **Recuperación:** las molestias quirúrgicas iniciales suelen disminuir durante los primeros días, mientras que la rehabilitación completa puede requerir varios meses.\n\nEn determinados pacientes es posible instalar una prótesis provisional durante la etapa de cicatrización, según las condiciones clínicas.\n\n### Resultados\n\nLos resultados funcionales y estéticos definitivos se aprecian una vez instalada la prótesis final.\n\nEl tratamiento completo puede requerir **varios meses**, dependiendo del proceso de osteointegración, las condiciones óseas y los procedimientos adicionales necesarios.\n\nLos implantes dentales están diseñados para ofrecer una solución de larga duración. Con una adecuada higiene y controles periódicos, pueden mantenerse funcionales durante **muchos años**.\n\nSin embargo, los componentes protésicos pueden requerir ajustes, reparaciones o reemplazos debido al uso y desgaste natural.\n\nLa duración dependerá de las características de cada paciente, el mantenimiento y las condiciones de salud bucal.\n\n### Cuidados posteriores\n\nPara favorecer una adecuada recuperación y mantener la rehabilitación en buenas condiciones, se recomienda:\n\n- **Higiene bucal:** seguir las indicaciones específicas de limpieza de los implantes, encías y prótesis.\n- **Alimentación:** consumir alimentos blandos durante la recuperación quirúrgica y avanzar progresivamente según indicación profesional.\n- **Evitar fumar:** el tabaco aumenta el riesgo de complicaciones y puede afectar la integración de los implantes.\n- **Evitar esfuerzos intensos:** durante los primeros días posteriores a la cirugía, según las indicaciones recibidas.\n- **Controles periódicos:** asistir a las evaluaciones para revisar los tejidos, los implantes y el estado de la prótesis.\n- **Mantenimiento profesional:** realizar limpiezas y revisiones según el tipo de rehabilitación.\n\n#### Sobredentadura\n\n- Retirar y limpiar diariamente la prótesis siguiendo las indicaciones de la profesional.\n- Limpiar cuidadosamente los implantes y sistemas de retención.\n- Retirar la prótesis durante la noche, salvo indicación diferente.\n- Acudir a controles para revisar y reemplazar los componentes de retención cuando sea necesario.\n\n#### Prótesis total fija\n\n- Limpiar diariamente los espacios entre la prótesis y las encías con cepillos interdentales, dispositivos adecuados u otros elementos recomendados.\n- Mantener una higiene cuidadosa alrededor de los implantes.\n- Asistir a controles profesionales para evaluar la estabilidad, los tejidos de soporte y el estado de la estructura protésica.\n\nDespués de la cirugía es normal presentar inflamación, sensibilidad o hematomas temporales.\n\n**Importante:** ante dolor que empeora, fiebre, sangrado persistente, secreción o movilidad de algún componente, es importante solicitar una evaluación profesional.\n\n### Contraindicaciones y precauciones\n\nLa rehabilitación completa sobre implantes requiere una evaluación individualizada, especialmente cuando existen condiciones que pueden aumentar el riesgo de complicaciones.\n\nEntre ellas se encuentran:\n\n- **Enfermedad periodontal activa:** requiere tratamiento y control previo.\n- **Diabetes no controlada:** puede afectar la cicatrización y aumentar el riesgo de complicaciones.\n- **Tabaquismo:** incrementa el riesgo de fracaso de los implantes.\n- **Pérdida ósea importante:** puede requerir procedimientos complementarios o alternativas de tratamiento.\n- **Bruxismo:** puede generar sobrecargas y requerir medidas de protección.\n- **Uso de determinados medicamentos:** especialmente algunos tratamientos antirresortivos, que requieren evaluación específica.\n- **Enfermedades sistémicas no controladas:** pueden hacer necesario adaptar o postergar el procedimiento.\n\n**Cada paciente debe someterse a una evaluación clínica y radiográfica previa** para determinar la viabilidad del tratamiento y seleccionar la alternativa más adecuada.",
    "img": "/tratamiento-rehabilitacion-sobre-implantes.jpg",
    "imgFit": "contain",
    "imgBg": "#CDBDB1",
    "relacionados": [],
    "resumen": "Desde $2.100.000"
  },
  "profhilo": {
    "slug": "profhilo",
    "name": "Profhilo®",
    "sub": "Hidratación y firmeza facial",
    "desc": "Biorremodelación con ácido hialurónico que mejora la hidratación, elasticidad y calidad de la piel.",
    "cat": "Estética facial",
    "precios": [
      {
        "label": "1 jeringa",
        "price": "$250.000"
      },
      {
        "label": "2 jeringas",
        "price": "$470.000"
      }
    ],
    "nota": "",
    "enPortada": false,
    "seoTitle": "Profhilo: Hidratación y Firmeza Facial",
    "seoDesc": "Profhilo® mejora la hidratación, elasticidad y calidad de la piel mediante biorremodelación con ácido hialurónico, con resultados naturales.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Biorremodelación con ácido hialurónico que mejora la hidratación, elasticidad y calidad de la piel.",
    "contenido": "### ¿Profhilo® o Sculptra®?\n\nAunque ambos tratamientos suelen agruparse como bioestimuladores, no funcionan de la misma manera:\n\n- **Profhilo®:** está orientado principalmente a mejorar la hidratación, elasticidad y calidad de la piel mediante biorremodelación con ácido hialurónico.\n- **Sculptra®:** estimula la producción de colágeno y contribuye a mejorar gradualmente la estructura y el volumen de determinadas zonas faciales.\n\nEn tu evaluación definiremos cuál es el más adecuado para ti, o si conviene combinarlos.",
    "img": "/tratamiento-bioestimuladores.jpg",
    "relacionados": [
      "bioestimuladores",
      "sculptra"
    ],
    "resumen": "Desde $250.000"
  },
  "sculptra": {
    "slug": "sculptra",
    "name": "Sculptra®",
    "sub": "Bioestimulador de colágeno",
    "desc": "Estimula tu propio colágeno para recuperar progresivamente la firmeza y estructura de la piel.",
    "cat": "Estética facial",
    "precios": [
      {
        "label": "Sculptra®",
        "price": "$500.000",
        "antes": "$540.000"
      }
    ],
    "nota": "",
    "enPortada": false,
    "seoTitle": "Sculptra: Bioestimulador de Colágeno",
    "seoDesc": "Sculptra® estimula tu propio colágeno para recuperar progresivamente la firmeza y estructura de la piel, con resultados naturales de hasta 2 años.",
    "boton": "Agendar evaluación",
    "notaValor": [],
    "lead": "Estimula la producción natural de colágeno y recupera progresivamente la firmeza y estructura de tu piel.",
    "contenido": "### ¿Qué es?\n\nSculptra® es un tratamiento estético inyectable elaborado a base de ácido poli-L-láctico (PLLA), una sustancia biocompatible y biodegradable que estimula la producción natural de colágeno.\n\nA diferencia de los rellenos tradicionales, actúa de forma gradual, ayudando a recuperar la estructura y firmeza de la piel desde el interior.\n\nSu acción progresiva permite mejorar el aspecto de la flacidez, las arrugas y la pérdida de volumen facial, logrando resultados naturales y duraderos.\n\n### ¿Para quién es? ¿Qué trata?\n\nEstá indicado para personas que buscan mejorar los signos del envejecimiento facial, especialmente aquellos relacionados con la disminución de colágeno y la pérdida de volumen.\n\nSus principales beneficios incluyen:\n\n- **Pérdida de firmeza:** ayuda a mejorar la estructura y calidad de la piel.\n- **Flacidez facial:** contribuye a mejorar el aspecto de la piel con pérdida de sostén.\n- **Pérdida de volumen:** favorece la recuperación gradual del volumen en determinadas zonas del rostro.\n- **Arrugas y surcos:** ayuda a suavizar su apariencia.\n- **Textura de la piel:** contribuye a mejorar progresivamente su aspecto.\n\nEs una alternativa para quienes buscan un rejuvenecimiento facial gradual, sin cambios bruscos en sus facciones.\n\n### ¿Cómo es el procedimiento?\n\nEl tratamiento comienza con una evaluación personalizada para analizar la estructura facial, identificar las zonas que requieren tratamiento y establecer un protocolo según las necesidades de cada paciente.\n\nSculptra® se administra mediante pequeñas inyecciones en áreas específicas del rostro, utilizando una técnica adecuada para estimular la producción de colágeno.\n\n- **Duración:** aproximadamente 30 a 60 minutos.\n- **Anestesia:** puede utilizarse anestesia local o lidocaína para mayor comodidad.\n- **Sesiones:** habitualmente se recomiendan entre 2 y 3 sesiones, separadas por varias semanas, según evaluación profesional.\n- **Recuperación:** generalmente permite retomar las actividades cotidianas el mismo día.\n\n### Resultados\n\nLos resultados aparecen de forma gradual, a medida que el organismo produce nuevo colágeno.\n\nLas primeras mejoras pueden comenzar a observarse aproximadamente al mes del tratamiento, evolucionando progresivamente durante los meses siguientes.\n\nLos resultados pueden mantenerse **hasta 2 años**, dependiendo de las características individuales, la zona tratada y el protocolo realizado.\n\n### Cuidados posteriores\n\nPara favorecer una adecuada recuperación y distribución del producto, se recomienda:\n\n- **Realizar masajes en las zonas tratadas durante 5 minutos, 5 veces al día, por 5 días**, siguiendo las instrucciones de la profesional.\n- Evitar el ejercicio físico intenso durante las primeras 24 horas.\n- Evitar la exposición solar intensa y el calor excesivo mientras persistan la inflamación o el enrojecimiento.\n- Aplicar compresas frías según indicación profesional para disminuir la inflamación.\n- Seguir las recomendaciones específicas entregadas después del procedimiento.\n\nEs posible presentar inflamación, sensibilidad, enrojecimiento o pequeños hematomas durante los primeros días.\n\n**Importante:** en algunos casos pueden aparecer nódulos o irregularidades que requieren evaluación profesional. Aunque son poco frecuentes, también existen complicaciones vasculares graves asociadas a los tratamientos inyectables.\n\n### Contraindicaciones\n\nEl tratamiento está contraindicado o requiere especial evaluación en situaciones como:\n\n- Embarazo y período de lactancia, debido a la falta de información suficiente sobre su seguridad.\n- Alergia conocida al ácido poli-L-láctico o a alguno de los componentes del producto.\n- Antecedentes de alergias graves o anafilaxia.\n- Tendencia a desarrollar cicatrices queloides o hipertróficas.\n- Infecciones o inflamaciones activas en la zona de aplicación.\n- Determinadas enfermedades o tratamientos que puedan afectar la respuesta inmunológica o la cicatrización.\n\n**Cada tratamiento requiere una evaluación profesional previa** para determinar la indicación y el protocolo más adecuado, considerando las características y antecedentes de salud de cada paciente.\n\n### ¿Profhilo® o Sculptra®?\n\nAunque ambos tratamientos suelen agruparse como bioestimuladores, no funcionan de la misma manera:\n\n- **Profhilo®:** está orientado principalmente a mejorar la hidratación, elasticidad y calidad de la piel mediante biorremodelación con ácido hialurónico.\n- **Sculptra®:** estimula la producción de colágeno y contribuye a mejorar gradualmente la estructura y el volumen de determinadas zonas faciales.\n\nEn tu evaluación definiremos cuál es el más adecuado para ti, o si conviene combinarlos.",
    "img": "/tratamiento-bioestimuladores.jpg",
    "relacionados": [
      "bioestimuladores",
      "profhilo"
    ],
    "resumen": "$500.000"
  }
};

export const CATEGORIAS: Categoria[] = [
  {
    "title": "Estética facial",
    "desc": "Tratamientos diseñados para armonizar el rostro, revitalizar la piel y potenciar la belleza natural mediante procedimientos seguros, personalizados y mínimamente invasivos.",
    "slugs": [
      "acido-hialuronico",
      "toxina-botulinica",
      "mesoterapia",
      "bioestimuladores",
      "tratamiento-de-ojeras",
      "mesoplastia-de-papada"
    ]
  },
  {
    "title": "Odontología general",
    "desc": "Cuidamos la salud de tu sonrisa con tratamientos preventivos y restauradores que combinan funcionalidad, estética y bienestar.",
    "slugs": [
      "limpieza-dental",
      "blanqueamiento-dental",
      "restauraciones-dentales",
      "extracciones-dentales",
      "protesis-dentales"
    ]
  },
  {
    "title": "Implantología",
    "desc": "Recuperamos la funcionalidad y la estética de tu sonrisa mediante implantes dentales de alta precisión, devolviendo seguridad y calidad de vida.",
    "slugs": [
      "implante-dental-unitario",
      "rehabilitacion-sobre-implantes"
    ]
  }
];
