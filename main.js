import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBB } from "three/examples/jsm/math/OBB";

let camera, scene, renderer, controls, light, fog; 

// Объекты
let cube, wall1, wall2, wall3, wall4, planet, mercury, 
    cube1, tor, cylinder, mesh, mixer;

// Объявляю обертки объектов
let wrapWall1, wrapWall2, wrapWall3, wrapWall4, wrapFlower,
    wrapPlanet3D, wrapTor, wrapMercury, wrapCube, wrapCylinder;

let raycaster;
let canJump = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

const activeMoveDirections = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

function init() {
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xfffafa, 1); //удаляю черный фон 
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader()
	.setPath( 'img/textures/' )
	.load( [
		'stern.jpg',
        'stern.jpg',
        'stern.jpg',
        'stern.jpg',
        'stern.jpg',
        'stern.jpg'
	] );
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.5, 2000);
    document.body.appendChild( renderer.domElement );

    controls = new PointerLockControls( camera, document.body );

    document.addEventListener( 'click', function () {
        controls.lock();
    });

    // Перемещение
    const onKeyDown = function(event) {
        if (event.key === 'ArrowUp' || event.key === 'w') {
            activeMoveDirections.forward = true;
        }
        else if (event.key === 'ArrowBottom' || event.key === 's') {
            activeMoveDirections.backward = true
        }
        if (event.key === 'ArrowLeft' || event.key === 'a') {
            activeMoveDirections.left = true
        }
        else if (event.key === 'ArrowRight' || event.key === 'd') {
            activeMoveDirections.right = true
        }
        if (event.code === 'Space' && canJump === true) {
            velocity.y += 350;
        }
    }

    const handleKeyup = event => {
        if (event.key === 'ArrowUp' || event.key === 'w') {
            activeMoveDirections.forward = false;
        }
        else if (event.key === 'ArrowBottom' || event.key === 's') {
            activeMoveDirections.backward = false
        }
        if (event.key === 'ArrowLeft' || event.key === 'a') {
            activeMoveDirections.left = false
        }
        if (event.key === 'ArrowRight' || event.key === 'd') {
            activeMoveDirections.right = false
        }
    }
    // Перемещение
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener('keyup', handleKeyup);
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 ); // Куда указывает мышь пользователя в 3D-сцене
}

function initScene() {
    // Обертка для Wall1
    const geometryWall1 = new THREE.BoxGeometry(1, 50, 1000);
    geometryWall1.computeBoundingBox();
    wrapWall1 = new THREE.Mesh(geometryWall1, new THREE.MeshBasicMaterial());
    wrapWall1.material.transparent = true;
    wrapWall1.material.opacity = 0;
    wrapWall1.position.set(501, 25, 0);
    wrapWall1.geometry.userData.obb = new OBB().fromBox3(wrapWall1.geometry.boundingBox);
    wrapWall1.userData.obb = new OBB();
    scene.add(wrapWall1);

    // Обертка для Wall2
    const geometryWall2 = new THREE.BoxGeometry(1, 50, 1000);
    geometryWall2.computeBoundingBox();
    wrapWall2 = new THREE.Mesh(geometryWall2, new THREE.MeshBasicMaterial());
    wrapWall2.material.transparent = true;
    wrapWall2.material.opacity = 0;
    wrapWall2.position.set(-501, 25, 0);
    wrapWall2.geometry.userData.obb = new OBB().fromBox3(wrapWall2.geometry.boundingBox);
    wrapWall2.userData.obb = new OBB();
    scene.add(wrapWall2);

    // Обертка для Wall3
    const geometryWall3 = new THREE.BoxGeometry(1000, 50, 1);
    geometryWall3.computeBoundingBox();
    wrapWall3 = new THREE.Mesh(geometryWall3, new THREE.MeshBasicMaterial());
    wrapWall3.material.transparent = true;
    wrapWall3.material.opacity = 0;
    wrapWall3.position.set(0, 25, -501);
    wrapWall3.geometry.userData.obb = new OBB().fromBox3(wrapWall3.geometry.boundingBox);
    wrapWall3.userData.obb = new OBB();
    scene.add(wrapWall3);

    // Обертка для Wall4
    const geometryWall4 = new THREE.BoxGeometry(1000, 50, 1);
    geometryWall4.computeBoundingBox();
    wrapWall4 = new THREE.Mesh(geometryWall4, new THREE.MeshBasicMaterial());
    wrapWall4.material.transparent = true;
    wrapWall4.material.opacity = 0;
    wrapWall4.position.set(0, 25, 501);
    wrapWall4.geometry.userData.obb = new OBB().fromBox3(wrapWall4.geometry.boundingBox);
    wrapWall4.userData.obb = new OBB();
    scene.add(wrapWall4);

    // Обертка для камеры
    const geometry = new THREE.BoxGeometry(10, 40, 30);
    geometry.computeBoundingBox();
    const material = new THREE.MeshPhongMaterial();
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(4, 20, 0);
    mesh.geometry.userData.obb = new OBB().fromBox3(mesh.geometry.boundingBox);
    mesh.userData.obb = new OBB();
    scene.add(mesh);

    // Обертка для цветка
    const geometryFlower = new THREE.BoxGeometry(25, 80, 25);
    geometryFlower.computeBoundingBox();
    wrapFlower = new THREE.Mesh(geometryFlower, new THREE.MeshBasicMaterial());
    wrapFlower.material.transparent = true;
    wrapFlower.material.opacity = 0;
    wrapFlower.position.set(70, 5, -150);
    wrapFlower.geometry.userData.obb = new OBB().fromBox3(wrapFlower.geometry.boundingBox);
    wrapFlower.userData.obb = new OBB();
    scene.add(wrapFlower);

     // Обертка для планеты 3D
    const geometryPlanet3D = new THREE.BoxGeometry(40, 60, 140);
    geometryPlanet3D.computeBoundingBox();
    wrapPlanet3D = new THREE.Mesh(geometryPlanet3D, new THREE.MeshBasicMaterial());
    wrapPlanet3D.material.transparent = true;
    wrapPlanet3D.material.opacity = 0;
    wrapPlanet3D.position.set(340, 45, 200);
    wrapPlanet3D.geometry.userData.obb = new OBB().fromBox3(wrapPlanet3D.geometry.boundingBox);
    wrapPlanet3D.userData.obb = new OBB();
    scene.add(wrapPlanet3D);

      // Обертка для тора
    const geometryTor = new THREE.BoxGeometry(48, 80, 20);
    geometryTor.computeBoundingBox();
    wrapTor = new THREE.Mesh(geometryTor, new THREE.MeshBasicMaterial());
    wrapTor.material.transparent = true;
    wrapTor.material.opacity = 0;
    wrapTor.position.set(100, 35, 0);
    wrapTor.geometry.userData.obb = new OBB().fromBox3(wrapTor.geometry.boundingBox);
    wrapTor.userData.obb = new OBB();
    scene.add(wrapTor);

    // Обертка Меркурий
    const geometryMerc = new THREE.BoxGeometry(55, 55, 55);
    geometryMerc.computeBoundingBox();
    wrapMercury = new THREE.Mesh(geometryMerc, new THREE.MeshBasicMaterial());
    wrapMercury.material.transparent = true;
    wrapMercury.material.opacity = 0;
    wrapMercury.position.set(-170, 35, -200);
    wrapMercury.geometry.userData.obb = new OBB().fromBox3(wrapMercury.geometry.boundingBox);
    wrapMercury.userData.obb = new OBB();
    scene.add(wrapMercury);

    // Обертка куба
    const geometryCube = new THREE.BoxGeometry(31, 31, 31);
    geometryCube.computeBoundingBox();
    wrapCube = new THREE.Mesh(geometryCube, new THREE.MeshBasicMaterial());
    wrapCube.material.transparent = true;
    wrapCube.material.opacity = 0;
    wrapCube.position.set(0, 40, 190);
    wrapCube.geometry.userData.obb = new OBB().fromBox3(wrapCube.geometry.boundingBox);
    wrapCube.userData.obb = new OBB();
    scene.add(wrapCube);

    // Обертка цилиндр
    const geometryCylinder = new THREE.BoxGeometry(53, 53, 53);
    geometryCylinder.computeBoundingBox();
    wrapCylinder = new THREE.Mesh(geometryCylinder, new THREE.MeshBasicMaterial());
    wrapCylinder.material.transparent = true;
    wrapCylinder.material.opacity = 0;
    wrapCylinder.position.set(-150, 40, 90);
    wrapCylinder.geometry.userData.obb = new OBB().fromBox3(wrapCylinder.geometry.boundingBox);
    wrapCylinder.userData.obb = new OBB();
    scene.add(wrapCylinder);

    // Заполняющий свет сцены
    scene.AmbLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
    scene.add(scene.AmbLight);

    // Туман
    fog = new THREE.FogExp2(0xaaaaaa, 0.0007);
    scene.fog = fog;

    // Земля
    let texture = new THREE.TextureLoader().load( 'img/Snow002_4K_Roughness.png' );
    const planeGeometry = new THREE.PlaneGeometry( 1000, 1000, 320, 320 );
    const planeMaterial = new THREE.MeshStandardMaterial( { map: texture } )
    cube = new THREE.Mesh( planeGeometry, planeMaterial );
    cube.rotation.x = - Math.PI / 2;
    cube.position.set(0, 1, 0);
    cube.receiveShadow = true;
    scene.add( cube );

    // Стена 1
    let textureWall1 = new THREE.TextureLoader().load( 'img/Brick-2.jpg' );
    let Wall1Geom = new THREE.BoxGeometry( 1, 50, 1000 );
    let Wall1Mat = new THREE.MeshBasicMaterial( { map: textureWall1 } );
    wall1 = new THREE.Mesh(Wall1Geom, Wall1Mat);
    wall1.position.set(500, 25, 0);
    scene.add(wall1);

    // Стена 2
    let textureWall2 = new THREE.TextureLoader().load( 'img/Brick-2.jpg' );
    let Wall2Geom = new THREE.BoxGeometry( 1, 50, 1000 );
    let Wall2Mat = new THREE.MeshBasicMaterial( { map: textureWall2 } );
    wall2 = new THREE.Mesh(Wall2Geom, Wall2Mat);
    wall2.position.set(-500, 25, 0);
    scene.add(wall2);

    // Стена 3
    let textureWall3 = new THREE.TextureLoader().load( 'img/Brick-2.jpg' );
    let Wall3Geom = new THREE.BoxGeometry( 1000, 50, 1 );
    let Wall3Mat = new THREE.MeshBasicMaterial( { map: textureWall3 } );
    wall3 = new THREE.Mesh(Wall3Geom, Wall3Mat);
    wall3.position.set(0, 25, -500);
    scene.add(wall3);

    // Стена 4
    let textureWall4 = new THREE.TextureLoader().load( 'img/Brick-2.jpg' );
    let Wall4Geom = new THREE.BoxGeometry( 1000, 50, 1 );
    let Wall4Mat = new THREE.MeshBasicMaterial( { map: textureWall4 } );
    wall4 = new THREE.Mesh(Wall4Geom, Wall4Mat);
    wall4.position.set(0, 25, 500);
    scene.add(wall4);

    // Планета Земля
    let texturePlanet = new THREE.TextureLoader().load( 'img/planet-1.jpg' );
    let planetGeom = new THREE.SphereGeometry(10, 30, 30);
    let planetMat = new THREE.MeshPhongMaterial({ map: texturePlanet });
    planet = new THREE.Mesh(planetGeom, planetMat);
    planet.position.set(100, 35, 0);
    planet.castShadow = true; 
    scene.add(planet);

    // Планета Меркурий
    let textureMercury = new THREE.TextureLoader().load( 'img/mercury.jpg' );
    let MercuryGeom = new THREE.SphereGeometry(25, 40, 40);
    let MercuryMat = new THREE.MeshPhongMaterial({ map: textureMercury });
    mercury = new THREE.Mesh(MercuryGeom, MercuryMat);
    mercury.castShadow = true; 
    mercury.position.set(-170, 35, -200);
    scene.add(mercury);

    // Куб
    let textureCube1 = new THREE.TextureLoader().load( 'img/metal-5.jpg' );
    let Cube1Geom = new THREE.BoxGeometry( 30, 30, 30 );
    let Cube1Mat = new THREE.MeshBasicMaterial( { map: textureCube1 } );
    cube1 = new THREE.Mesh(Cube1Geom, Cube1Mat);
    cube1.position.set(0, 40, 190);
    cube1.castShadow = true;
    scene.add(cube1);

    // Тор
    let textureTor = new THREE.TextureLoader().load( 'img/planet-1.jpg' );
    let TorGeom = new THREE.TorusGeometry( 20, 3, 16, 50 ); 
    let TorMat = new THREE.MeshPhongMaterial({ map: textureTor });
    tor = new THREE.Mesh(TorGeom, TorMat);
    tor.position.set(100, 35, 0);
    tor.castShadow = true;
    scene.add(tor);

    // Цилиндр
    let textureCylinder = new THREE.TextureLoader().load( 'img/velvet-1.jpg' );
    let CylinderGeom = new THREE.CylinderGeometry( 25, 15, 20, 32 ); 
    let CylinderMat = new THREE.MeshBasicMaterial( { map: textureCylinder } );
    cylinder = new THREE.Mesh(CylinderGeom, CylinderMat);
    cylinder.position.set(-150, 40, 90);
    cylinder.castShadow = true;
    scene.add(cylinder);

    // GLTF модель 1
    const loader = new GLTFLoader();
    loader.load("models/potted_plant_01_4k.gltf/potted_plant_01_4k.gltf", 
        function(gltf){
            gltf.scene.traverse( function( node ) {
                if ( node.isMesh ) { node.castShadow = true; }
            });
            gltf.scene.scale.set(50, 50, 50); // Масштаб модели
            gltf.scene.position.set( 70, 15, -150 ); // Изменение позиции
            scene.add(gltf.scene);
        });

    // GLTF модель 2
    loader.load("models/shark/shark.gltf", 
        function(gltf){
            gltf.scene.traverse( function( node ) {
                if ( node.isMesh ) { node.castShadow = true; }
            });
            mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach((clip) => {mixer.clipAction(clip).play(); });
            gltf.scene.scale.set(15, 15, 15); // Масштаб модели
            gltf.scene.position.set( 340, 45, 200 ); // Изменение позиции
            scene.add(gltf.scene);
        });

    //Сетка
    let plane = new THREE.GridHelper(1000, 25); 
    scene.add(plane);

    //Cвет
    light = new THREE.DirectionalLight(0xffffff, 1); 
    light.position.set(200, 200, 540);
    light.castShadow = true;
    light.shadow.camera.top = 250;
    light.shadow.camera.bottom = - 200;
    light.shadow.camera.left = - 300;
    light.shadow.camera.right = 300;
    light.shadow.camera.near = 5;
    light.shadow.camera.far = 1500; //Глубина
    scene.add(light);

    //Добавил обертку для камеры
    camera.add( mesh ); 

    // const helper = new THREE.CameraHelper( light.shadow.camera );
    // scene.add( helper );
    camera.position.set(0, 50, 0);
}

function intersectObjects() {
    let vectorX;
    let vectorY;
    let vectorZ;
    
    mesh.position.x = Math.sin(clock.getElapsedTime() * 0.5) * 4;
    mesh.userData.obb.copy(mesh.geometry.userData.obb);
    mesh.userData.obb.applyMatrix4(mesh.matrixWorld);

    wrapWall1.userData.obb.copy(wrapWall1.geometry.userData.obb);
    wrapWall1.userData.obb.applyMatrix4(wrapWall1.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapWall1.userData.obb)) {
            vectorX = camera.position.x - 3;
            vectorY = camera.position.y;
            vectorZ = camera.position.z;
            camera.position.set(vectorX, vectorY, vectorZ);
        } 

    wrapWall2.userData.obb.copy(wrapWall2.geometry.userData.obb);
    wrapWall2.userData.obb.applyMatrix4(wrapWall2.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapWall2.userData.obb)) {
            vectorX = camera.position.x + 3;
            vectorY = camera.position.y;
            vectorZ = camera.position.z;
            camera.position.set(vectorX, vectorY, vectorZ);
        } 

    wrapWall3.userData.obb.copy(wrapWall3.geometry.userData.obb);
    wrapWall3.userData.obb.applyMatrix4(wrapWall3.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapWall3.userData.obb)) {
            vectorX = camera.position.x;
            vectorY = camera.position.y;
            vectorZ = camera.position.z + 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        } 

    wrapWall4.userData.obb.copy(wrapWall4.geometry.userData.obb);
    wrapWall4.userData.obb.applyMatrix4(wrapWall4.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapWall4.userData.obb)) {
            vectorX = camera.position.x;
            vectorY = camera.position.y;
            vectorZ = camera.position.z - 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        } 

    wrapFlower.userData.obb.copy(wrapFlower.geometry.userData.obb);
    wrapFlower.userData.obb.applyMatrix4(wrapFlower.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapFlower.userData.obb)) {
            vectorX = camera.position.x - 3;
            vectorY = camera.position.y - 3;
            vectorZ = camera.position.z - 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        } 

    wrapPlanet3D.userData.obb.copy(wrapPlanet3D.geometry.userData.obb);
    wrapPlanet3D.userData.obb.applyMatrix4(wrapPlanet3D.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapPlanet3D.userData.obb)) {
            vectorX = camera.position.x - 3;
            vectorY = camera.position.y - 3;
            vectorZ = camera.position.z - 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        } 

    wrapTor.userData.obb.copy(wrapTor.geometry.userData.obb);
    wrapTor.userData.obb.applyMatrix4(wrapTor.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapTor.userData.obb)) {
            vectorX = camera.position.x - 3;
            vectorY = camera.position.y - 3;
            vectorZ = camera.position.z - 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        }
    
    wrapMercury.userData.obb.copy(wrapMercury.geometry.userData.obb);
    wrapMercury.userData.obb.applyMatrix4(wrapMercury.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapMercury.userData.obb)) {
            vectorX = camera.position.x - 3;
            vectorY = camera.position.y - 3;
            vectorZ = camera.position.z - 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        }

    wrapCube.userData.obb.copy(wrapCube.geometry.userData.obb);
    wrapCube.userData.obb.applyMatrix4(wrapCube.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapCube.userData.obb)) {
            vectorX = camera.position.x - 3;
            vectorY = camera.position.y - 3;
            vectorZ = camera.position.z - 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        }

    wrapCylinder.userData.obb.copy(wrapCylinder.geometry.userData.obb);
    wrapCylinder.userData.obb.applyMatrix4(wrapCylinder.matrixWorld);
        if (mesh.userData.obb.intersectsOBB(wrapCylinder.userData.obb)) {
            vectorX = camera.position.x - 3;
            vectorY = camera.position.y - 3;
            vectorZ = camera.position.z - 3;
            camera.position.set(vectorX, vectorY, vectorZ);
        }
    }

function render() {
    // Логика для прыжков
const time = performance.now(); // Отметка времени в мс
    if (controls) {
        const intersections = raycaster.intersectObjects(false);
        const onObject = intersections.length > 0;
        const delta = ( time - prevTime ) / 1000;
        
        velocity.y -= 9.8 * 100.0 * delta;
        direction.z = Number(activeMoveDirections.forward) - Number(activeMoveDirections.backward);
        direction.x = Number(activeMoveDirections.right) - Number(activeMoveDirections.left);
        direction.normalize(); // Последовательное движение во всех направлениях

        controls.moveRight(direction.x * delta * 250);
        controls.moveForward(direction.z * delta * 250);

            if ( onObject === true ) {
                velocity.y = Math.max( 0, velocity.y );
                canJump = true;
            }

            controls.getObject().position.y += ( velocity.y * delta );

            if ( controls.getObject().position.y < 40 ) {
                velocity.y = 0;
                controls.getObject().position.y = 40;
                canJump = true;
            }
        }
    prevTime = time;
    intersectObjects();
    
    //Анимация планеты Земля
    planet.rotation.x += 0.005;
    planet.rotation.y += 0.01;
    //Анимация Меркурия
    mercury.translateX(Math.sin(Date.now() * 0.001) * Math.PI * 0.5);
    wrapMercury.translateX(Math.sin(Date.now() * 0.001) * Math.PI * 0.5); 
    //Анимация тoра
    tor.rotation.y = Math.sin(Date.now() * 0.001) * Math.PI * 0.5;
    //Анимация куба
    cube1.rotation.x = Math.sin(Date.now() * 0.001) * Math.PI * 2;
    //Анимация Цилиндра
    cylinder.translateY(Math.sin(Date.now() * 0.001) * Math.PI * 0.1);
    wrapCylinder.translateY(Math.sin(Date.now() * 0.001) * Math.PI * 0.1); 

    renderer.render(scene, camera);
    requestAnimationFrame(render);
    
    //Запуск анимации акулы
    const deltaGltf = clock.getDelta();
	if ( mixer ) mixer.update( deltaGltf );
}

init();
initScene();
render();
