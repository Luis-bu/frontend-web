# Instrucciones de diseño UI para Copilot

Este proyecto es una aplicación Angular moderna.

Cuando modifiques o generes interfaces, debes rediseñar con una estética premium, editorial, creativa y moderna, inspirada en sitios como:
- agency51.com
- le-lab.io
- interfaces tipo startup, producto SaaS, portfolio creativo y landing page premium

Objetivo visual:
La interfaz debe verse como un producto real, moderno, limpio y visualmente memorable. Evita por completo interfaces genéricas, académicas, básicas o estilo Bootstrap antiguo.

Reglas visuales:
- Usa Tailwind CSS para los estilos.
- Diseña mobile-first y responsive.
- Usa layouts con mucho aire, buena jerarquía visual y composición clara.
- Usa tipografía grande, titulares fuertes y subtítulos sobrios.
- Usa fondos con gradientes suaves, formas abstractas, líneas decorativas, blur, glassmorphism sutil o patrones minimalistas cuando tenga sentido.
- Usa cards modernas con rounded-2xl, border sutil, shadow suave y hover states.
- Usa botones con transiciones, estados hover, active y focus.
- Usa microinteracciones con transition-all, hover:-translate-y-1, hover:shadow-xl, etc.
- Usa colores sobrios y modernos: slate, zinc, neutral, sky, cyan, indigo, violet, emerald.
- No uses colores aleatorios chillones.
- No uses HTML plano sin diseño.
- No uses estilos genéricos de formulario básico.
- No rompas la lógica TypeScript existente.
- Mantén las rutas, servicios, modelos y métodos existentes.
- Puedes modificar HTML y CSS de los componentes.
- Si necesitas mejorar estructura visual, puedes agregar wrappers, secciones, cards, headers, empty states, badges y navegación.
- Prioriza consistencia visual en todo el proyecto.

Reglas de Angular:
- Mantén la lógica de los archivos .ts salvo que sea necesario para mejorar la presentación.
- No elimines bindings existentes como *ngFor, *ngIf, [(ngModel)], (click), [routerLink], etc.
- No cambies nombres de métodos existentes.
- Si agregas iconos, usa lucide-angular.
- Evita dependencias innecesarias.

Resultado esperado:
Cada vista debe parecer una interfaz profesional de producción, no una tarea universitaria.