// imports
importScripts('js/sw-utils.js')
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';
const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/spiderman.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/wolverine.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/hulk.jpg',
    'js/app.js',
    'js/sw-utils.js',
];
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js', 
]; 

self.addEventListener('install', event =>{

    const cacheStatic = caches.open( STATIC_CACHE )
    .then( cache=>{
        return cache.addAll(APP_SHELL);
    });

    const cacheInmutable = caches.open( INMUTABLE_CACHE )
    .then( cache=>{
        return cache.addAll(APP_SHELL_INMUTABLE);
    });

    event.waitUntil( Promise.all([ [cacheStatic, cacheInmutable] ]));
});

self.addEventListener('activate', e => {
    const respuesta = caches.keys().then( keys => {
        keys.forEach( key => {
            // static-v4
            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }
        });

    });
    e.waitUntil( respuesta );
});

// cache with network fallback
// En caso de no encontrar el recurso en el cache buscar en la red
self.addEventListener('fetch', e =>{ 
    const respuesta = caches.match( e.request ).then( resp =>{
        if ( resp ){
            return resp; 
        }else{
            // no existe el archivo, buscar en la web
            console.log( "no existe: ", e.request.url );
        }


        return fetch( e.request ).then( newResp => {
            
            return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newResp );

        }).catch( err => { 
            if ( e.request.headers.get('accept').includes('text/html') ) {
                return caches.match('/pages/offline.html');
            } 
        });
    });

    e.respondWith( respuesta )   
});






