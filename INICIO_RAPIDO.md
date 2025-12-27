# 🚀 GUÍA RÁPIDA DE INICIO

## Paso 1: Instalar dependencias
```bash
npm install
```

## Paso 2: Configurar Firebase

### 2.1 Crear proyecto en Firebase
1. Ve a https://console.firebase.google.com
2. Crea un nuevo proyecto
3. Dale un nombre (ej: "bingo-online")

### 2.2 Habilitar Authentication
1. En el menú lateral → Authentication
2. Botón "Comenzar"
3. Habilita "Correo electrónico/Contraseña"

### 2.3 Crear Firestore Database
1. En el menú lateral → Firestore Database
2. Botón "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba"
4. Elige tu región

### 2.4 Configurar Reglas de Firestore
En la pestaña "Reglas" de Firestore, pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Haz clic en "Publicar"

### 2.5 Obtener credenciales
1. Icono ⚙️ → Configuración del proyecto
2. En "Tus apps" → Selecciona la app web (o créala)
3. Copia los valores de firebaseConfig

### 2.6 Configurar en tu proyecto
Abre `src/utils/firebase.js` y reemplaza con tus valores:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "tu-messaging-sender-id",
  appId: "tu-app-id"
};
```

## Paso 3: Ejecutar la aplicación
```bash
npm start
```

La app se abrirá en http://localhost:3000

## Paso 4: Probar la aplicación

1. **Regístrate** con un correo y contraseña
2. **Crea una sala** como host
3. **Abre otra ventana** (modo incógnito) y regístrate con otro usuario
4. **Únete a la sala** con el código
5. Como host, selecciona modo de juego e **inicia el juego**
6. Como host, **gira la tómbola** para sacar números
7. Ambos jugadores **marcan números** en sus cartones
8. ¡El primero en completar el patrón **gana**! 🎉

## 🆘 Problemas Comunes

**Error: "Firebase not initialized"**
→ Verifica que hayas configurado firebase.js correctamente

**Error: "Permission denied"**
→ Asegúrate de haber configurado las reglas de Firestore

**No funciona en tiempo real**
→ Verifica que Firestore esté en "Native mode" (no Datastore)

## 📱 Para probar con múltiples dispositivos

1. Obtén tu IP local:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` o `ip addr`

2. Otros dispositivos pueden acceder en:
   ```
   http://TU_IP:3000
   ```
   Ejemplo: http://192.168.1.100:3000

## 🚀 Para deployment en producción

Lee el README.md completo para instrucciones de deployment en:
- Vercel (recomendado)
- Firebase Hosting
- Netlify

---

¡Listo! Ahora tienes tu Bingo Online funcionando 🎰🎉
