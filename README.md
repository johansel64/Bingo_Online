# 🎰 Bingo Online

Aplicación web de Bingo en tiempo real con React y Firebase.

## ✨ Características

- 🔐 Autenticación con email y contraseña
- 🎲 Salas de juego en tiempo real
- 👥 Múltiples jugadores simultáneos
- 🎯 Múltiples modos de juego (Lleno, L, X, 4 Esquinas, Línea)
- 🎰 Sistema de tómbola para el host
- 📱 Responsive design
- 🎉 Efectos visuales (confetti al ganar)
- 📋 Historial de números sacados

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18
- **Routing**: React Router v6
- **Backend**: Firebase (Authentication + Firestore)
- **Estilos**: TailwindCSS
- **Animaciones**: Canvas Confetti

## 📋 Prerequisitos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta de Firebase (gratuita)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd bingo-online
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

#### a) Crear proyecto en Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Agregar proyecto"
3. Sigue los pasos para crear tu proyecto

#### b) Habilitar Authentication:

1. En la consola de Firebase, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Habilita el método de **Correo electrónico/Contraseña**

#### c) Crear base de datos Firestore:

1. En la consola de Firebase, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (o configura reglas personalizadas)
4. Elige la ubicación más cercana

#### d) Configurar reglas de Firestore:

En la pestaña "Reglas" de Firestore, agrega estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura a usuarios autenticados
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### e) Obtener configuración:

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. En "Tus apps", selecciona la app web (</>) o créala
3. Copia los valores de configuración

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` y reemplaza con tus valores de Firebase:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
```

También actualiza el archivo `src/utils/firebase.js` con tu configuración.

### 5. Ejecutar la aplicación

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## 🎮 Cómo Jugar

### Para el Host:

1. **Regístrate** o **Inicia sesión**
2. Haz clic en **"Crear Sala"**
3. **Comparte el código** de sala con otros jugadores
4. Selecciona el **modo de juego**
5. Cuando todos estén listos, haz clic en **"Iniciar Juego"**
6. Usa el botón **"Girar Tómbola"** para sacar números
7. Los jugadores marcarán sus cartones

### Para Jugadores:

1. **Regístrate** o **Inicia sesión**
2. Haz clic en **"Unirse a Sala"**
3. Ingresa el **código de sala** que te compartió el host
4. Espera a que el host inicie el juego
5. **Marca los números** en tu cartón cuando salgan
6. Completa el patrón requerido para **ganar**

## 🎯 Modos de Juego

- **Cartón Lleno**: Marcar todos los números del cartón
- **Línea**: Completar una línea horizontal
- **L**: Completar la primera columna y la última fila
- **X**: Completar ambas diagonales
- **4 Esquinas**: Marcar las cuatro esquinas del cartón

## 📁 Estructura del Proyecto

```
bingo-online/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Game/
│   │   │   ├── BingoCard.js
│   │   │   ├── NumberHistory.js
│   │   │   ├── PlayersList.js
│   │   │   └── Tombola.js
│   │   ├── Layout/
│   │   │   └── ProtectedRoute.js
│   │   └── Room/
│   │       ├── GameRoom.js
│   │       └── Home.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── utils/
│   │   ├── bingoLogic.js
│   │   └── firebase.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── .env
├── .env.example
├── package.json
└── README.md
```

## 🚀 Deployment

### Opción 1: Vercel (Recomendado)

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configura las variables de entorno en el dashboard de Vercel

### Opción 2: Firebase Hosting

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicia sesión:
```bash
firebase login
```

3. Inicializa hosting:
```bash
firebase init hosting
```

4. Build y deploy:
```bash
npm run build
firebase deploy
```

### Opción 3: Netlify

1. Build el proyecto:
```bash
npm run build
```

2. Arrastra la carpeta `build` a [Netlify Drop](https://app.netlify.com/drop)

## 🔒 Seguridad

Recuerda configurar las reglas de seguridad de Firestore en producción:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      // Solo usuarios autenticados pueden leer salas
      allow read: if request.auth != null;
      
      // Solo el host puede crear y actualizar salas
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.uid == resource.data.hostId ||
                        request.auth.uid in resource.data.players[*].id);
      
      // Solo el host puede eliminar
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.hostId;
    }
  }
}
```

## 🐛 Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Asegúrate de que las variables empiecen con `REACT_APP_`

### Error: "Permission denied"
- Verifica las reglas de Firestore
- Asegúrate de estar autenticado

### No se conecta en tiempo real
- Verifica que Firestore esté en modo "Native" (no Datastore mode)
- Revisa la consola del navegador para errores

## 📝 Próximas Mejoras

- [ ] Sistema de chat en sala
- [ ] Historial de partidas
- [ ] Tabla de clasificación
- [ ] Más patrones de victoria
- [ ] Sonidos y efectos
- [ ] Modo multijugador con torneos
- [ ] Sistema de puntos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto.

## 👨‍💻 Autor

Tu Nombre - johansel64

## 🙏 Agradecimientos

- Firebase por el backend en tiempo real
- React por el framework
- TailwindCSS por los estilos
- Canvas Confetti por las animaciones

---

**¡Diviértete jugando Bingo Online! 🎰🎉**
