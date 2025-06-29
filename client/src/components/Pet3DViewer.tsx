import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Pet3DViewerProps {
  petHash: string;
  width?: number;
  height?: number;
  className?: string;
  enableControls?: boolean;
}

export function Pet3DViewer({ 
  petHash, 
  width = 300, 
  height = 300, 
  className = "", 
  enableControls = true 
}: Pet3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const petModelRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 5;

    // Create pet model
    const petModel = createPetModel(petHash);
    scene.add(petModel);
    petModelRef.current = petModel;

    // Mouse controls
    if (enableControls) {
      setupMouseControls(renderer.domElement, petModel);
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Auto-rotate if controls are disabled
      if (!enableControls && petModel) {
        petModel.rotation.y += 0.01;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [petHash, width, height, enableControls]);

  const createPetModel = (hash: string): THREE.Group => {
    const modelGroup = new THREE.Group();
    const val = (s: number, e: number) => parseInt(hash.substring(s, e), 16);

    // Body
    const bodyColor = new THREE.Color().setHSL(val(0, 2) / 255, 0.7, 0.5);
    const bodyShape = val(2, 4) % 4;
    
    let bodyGeometry: THREE.BufferGeometry;
    switch(bodyShape) {
      case 0: bodyGeometry = new THREE.BoxGeometry(2, 2, 2); break;
      case 1: bodyGeometry = new THREE.SphereGeometry(1.2, 32, 32); break;
      case 2: bodyGeometry = new THREE.ConeGeometry(1.2, 2.2, 32); break;
      case 3: bodyGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); break;
      default: bodyGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    }
    
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: bodyColor, 
      roughness: 0.5, 
      metalness: 0.2 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    modelGroup.add(body);

    // Eyes
    const eyeColor = new THREE.Color().setHSL(val(4, 6) / 255, 1.0, 0.5);
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: eyeColor });
    
    const eyeDist = bodyShape === 1 ? 1.1 : 1.0;
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.5, 0.4, eyeDist);
    modelGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.5, 0.4, eyeDist);
    modelGroup.add(rightEye);

    // Horn (conditional)
    if (val(6, 8) > 100) {
      const hornColor = new THREE.Color().setHSL(val(8, 10) / 255, 0.6, 0.7);
      const hornGeometry = new THREE.ConeGeometry(0.3, 1, 16);
      const hornMaterial = new THREE.MeshStandardMaterial({ 
        color: hornColor, 
        roughness: 0.8 
      });
      const horn = new THREE.Mesh(hornGeometry, hornMaterial);
      
      const bodyHeight = bodyShape === 2 ? 2.2 : 2;
      horn.position.set(0, bodyHeight / 2 + 0.5, 0);
      horn.rotation.x = -Math.PI / 12;
      modelGroup.add(horn);
    }

    // Accessories based on hash
    if (val(10, 12) > 150) {
      // Add wings
      const wingColor = new THREE.Color().setHSL(val(12, 14) / 255, 0.8, 0.6);
      const wingGeometry = new THREE.PlaneGeometry(1, 1.5);
      const wingMaterial = new THREE.MeshStandardMaterial({ 
        color: wingColor, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      
      const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
      leftWing.position.set(-1.5, 0, -0.5);
      leftWing.rotation.z = Math.PI / 4;
      modelGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
      rightWing.position.set(1.5, 0, -0.5);
      rightWing.rotation.z = -Math.PI / 4;
      modelGroup.add(rightWing);
    }

    return modelGroup;
  };

  const setupMouseControls = (canvas: HTMLCanvasElement, target: THREE.Group) => {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !target) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      target.rotation.y += deltaMove.x * 0.005;
      target.rotation.x += deltaMove.y * 0.005;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
  };

  return (
    <div 
      ref={mountRef} 
      className={`relative ${className}`}
      style={{ width, height }}
    />
  );
}