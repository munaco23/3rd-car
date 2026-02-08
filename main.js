import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 2, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0, 15, 10);
spotLight.angle = 0.3;
spotLight.penumbra = 1;
spotLight.castShadow = true;
scene.add(spotLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-10, 10, 5);
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.8,
        roughness: 0.4
    })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);


let carModel;
gltfLoader.load('car.glb', (gltf) => {
    carModel = gltf.scene;
    carModel.scale.set(1.5, 1.5, 1.5);
    carModel.position.y = 0.5;
    carModel.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
        }
    });
    scene.add(carModel);

    // GSAP timeline for scroll-based animations
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.container',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        }
    });

    tl.to(carModel.rotation, { y: Math.PI * 2 });
    tl.to(camera.position, { z: 8 }, 0);
    tl.to(carModel.position, { y: -0.5 }, 0);
});

function animate() {
    requestAnimationFrame(animate);
        controls.update();
    renderer.render(scene, camera);
}

// Animate hero text
gsap.from('.hero h1', { duration: 1, y: -50, opacity: 0, ease: 'power3.out' });
gsap.from('.hero p', { duration: 1, y: -30, opacity: 0, delay: 0.5, ease: 'power3.out' });

// GSAP ScrollTrigger animations
const sections = document.querySelectorAll('section');
sections.forEach((section) => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
    });
});

// Mobile nav toggle
const menuIcon = document.querySelector('.menu-icon');
const navLinks = document.querySelector('.nav-links');

menuIcon.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    menuIcon.classList.toggle('toggle');

    if (navLinks.classList.contains('nav-active')) {
        gsap.from('.nav-links li', { opacity: 0, y: -20, duration: 0.5, stagger: 0.2, delay: 0.3 });
    }
});

// Animate nav on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});


animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
