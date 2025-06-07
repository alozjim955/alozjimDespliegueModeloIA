# Despliegue web de modelo IA

```
Autor: Alejandro Lozano Jiménez
Tutor: Francisco Javier Ávila Sánchez
```
```
I.E.S. Francisco Romero Vargas (Jerez de la Frontera)
Administración de Sistemas Informáticos en Red
Curso: 2024/2025
```
**Preparación............................................................................................................................ 2**
Introducción........................................................................................................................ 2
Finalidad............................................................................................................................. 2
Objetivos............................................................................................................................ 2
Medios necesarios............................................................................................................. 2
Planificación....................................................................................................................... 2
**Realización............................................................................................................................ 3**
Introducción........................................................................................................................ 3
Finalidad............................................................................................................................. 3
Objetivos............................................................................................................................ 3
Medios necesarios............................................................................................................. 3
Planificación....................................................................................................................... 3


**Despliegue web de modelo IA. Alejandro Lozano Jiménez**

## Preparación

### Introducción

El proyecto consiste en crear una aplicación que utilice Inteligencia Artificial y que realice las
consultas que le pida el usuario. La aplicación entonces se desplegará en un contenedor online
para su fácil portabilidad y acceso.

### Finalidad

El principal uso de esta herramienta es para consultas y tener un pequeño asistente personal. Cuando
se tenga una duda sobre algún tema, se le podrá preguntar a la Inteligencia Artificial por ayuda.
Esta responderá de forma personalizada según un perfil que hayamos elegido con anterioridad.

### Objetivos

En este proyecto se escribirá un programa que se encargue del funcionamiento del modelo
IA y su comportamiento. Después, se envolverá en una aplicación web (también
programada a mano) la cual se desplegará en un contenedor en la nube para que sea
portable, multiplataforma y fácilmente accesible desde un navegador web.

### Medios necesarios

- Ordenador con una tarjeta gráfica (preferiblemente de Nvidia).
- Editor de texto/IDE.
- Servicio de hospedaje en la nube.
- Intérprete de Python y/o Javascript y librerías.
- Conocimiento técnico de Python y la infraestructura web.

### Planificación

- Elección de las distintas librerías y dependencias de nuestro proyecto (PyTorch,
    Transformers, etc): 2 horas
- Configuración del entorno de desarrollo: 1 hora
- Adquisición del servicio de contenedores y su puesta en marcha: 1 hora
- Programación del núcleo del proyecto (armar el modelo IA en Python): 30 horas
- Creación de la envoltura web del núcleo (escribir la aplicación en
    Javascript/Typescript o Python): 20 horas
- Unión de los dos módulos creados: 5 horas
- Despliegue de la aplicación en un contenedor en la nube: 3 horas
- Testeo del proyecto en su conjunto: 8 horas

Horas totales planificadas para el proyecto: 70 horas

## Realización del proyecto

### Trabajos realizados
Como visión general de todo el trabajo realizado, puede resumirse en el desarrollo y 
despliegue del web impulsado pot IA en un servicio hospedado en la nube y contenerizado, 
con su respectivo servidor web, dominio y certificado SSL.

En primer lugar, se hizo un trabajo de investigación para buscar la forma en la que se 
podría implementar el modelo IA en nuestra infraestructura digital. Tras un periodo de 
análisis, se decidió por la librería oficial de OpenAI.

Lo siguiente fue el desarrollo de la aplicación. Tras muchos prototipos y versiones, la 
versión final se divide en dos partes claras. La primera es un sistema de inicio de sesión 
y registro de usuarios sencillo y minimalista, y la segunda es el propio chat con el que 
se puede interactuar con el modelo IA.

Después, se procedió a elegir que sistema de hospedaje web se utilizaría para el despliegue
wen de la aplicación. Luego de un tiempo de investigación, se eligió por el módulo de estudiante
de AWS Academy.

Por último, se configuró una imagen de Docker y un archivo de docker-compose para desplegar
rápidamente el proyecto en el servidor remoto. Además, se configuró un servidor de Nginx para
la redirección de la IP del servidor y su respectivo puerto a un dominio certificado con SSL. 

### Problemas encontrados
Los principales problemas se han encontrado con el propio modelo IA, y luego problemas 
menores con el ecosistema de desarrollo web.

Los problemas menos importantes fueron la elección de librerías a la hora de desarrollar la
interfaz gráfica de la aplicación. Por ejemplo, existe una librería de interfaces específicas
para aplicaciones IA llamada assistant-ui, que parece dar buenos resultados. El problema que
tiene es que la documentación está muy limitada y es difícil hacer cambios en el código. Esta
librería se acabó descartando y se pasó a una interfaz hecha a mano usando Next.js (con 
Javascript y CSS).

Una situación parecida ocurrió con otros elementos del sistema. Programas de terceros como 
NextAuth (sistema de autenticación) o Supabase (base de datos) tienen una documentación dispersa
y/o limitada, y es complicado integrarlos con el modelo IA como se relatará más adelante.

Con Next.js había que ser cuidadoso a la hora de elegir las librerías que importar, porque podrían
obsoletas (¡Aunque solo tuvieran 6 meses de antigüedad!), y la documentación no es estelar. Aunque 
era preferible usar este framework a usar herramientas más minimalistas como React o incluso Javascript
puro por tener un sistema con funcionalidades mínimas, y no tener que importar todo tipo de librerías
a mano para características básicas; como CSS personalizado, enrutado de archivos y páginas optimizadas.

Se ha tenido que usar el módulo de estudiante de AWS Academy debido a que no se ha podidio encontar un
mejor sistema de hospedaje web. El único interesante sería usar un VPS de Oracle, ya que existe una 
versión gratis. El único problema es que no existen servidores gratis en Europa.

Por último, los problemas más severos han venido a partir de la integración de la IA en la aplicación web.
Originalmente se pensó en utilizar un modelo local hosteado en un ordenador, pero se descubrió que era 
necesario hardware prohibitivamente caro para hacerlo funcionar en condiciones; una buena gráfica dedicada
a Inteligencia Artificial puede rondar los 2000€, y los servidores remotos que usan gráficas para el uso de
modelos IA tienen un precio alrededor de 13€ la hora. A la vista de todos estos problemas, se decidió por el
de una librería de OpenAI que usaría una API que se comunicaría con un modelo IA remoto.

El problema con este enfoque es que la API es limitada. Muchas funcionalidades que se tenían pensadas para
la aplicación se han descartado debido a la problemática de intentar implementarlas con esta librería, y la 
documentación de OpenAI es bastante extensa y compleja. Entre otras funcionalidades, se probó implementar un 
sistema de subida de imágenes y archivos y un panel de administración que pudiera modificar el código de la 
aplicación para que se pudiera cambiar el modelo de IA y su comportamiento en tiempo real. Pero todos estos 
esfuerzos se han visto frustados. El resultado final es que solo se puede procesar texto. Pero para un programa 
pensado para consultas, esto no es tan grave.

### Modificaciones hechas en el proyecto
- Uso de Next.js en vez de Python
- Uso de API de OpenAI en vez de modelo local
- Integración de SQLite
- Implementación de Docker

### Posibles mejoras en el proyecto
Las mayores mejoras se podrían encontrar en el modelo IA y su implementación. Hay que tener en cuenta que esto
es un programa ligero en el que la interfaz gráfica no va a cambiar mucho.

Lo interesante sería (si se tuvieran los recursos necesarios) poseer un modelo local en el que uno mismo
podría programar la API que conectara su modelo con la interfaz. Así podría implementarse funciones más complejas,
como la creación y modificación de chats con perfiles personalizados en tiempo real, la manipulación por parte del
modelo de distintos recursos digtales (como PDF, imágenes, archivos de texto, etc.).

Otra mejora interesante sería la mejora del sistema de inicio de sesión y registro usuarios, y que permitiera 
conectarse usando cuentas de servicios externos (como Gmail o Github).

### Bibliografía
- Documentación de OpenAI: https://platform.openai.com/docs/overview
- Documentación de Nextjs: https://nextjs.org/docs
- Documentación de Docker y Nginx: Apuntes del Ciclo formativo
- Foros y páginas web (Stack Overflow, Reddit) para la consulta de preguntas puntuales y detalles técnicos