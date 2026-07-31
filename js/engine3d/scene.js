// js/engine3d/scene.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true); // Inicia o motor WebGL

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    // Cor de fundo do ambiente 3D (combinando com a interface escura)
    scene.clearColor = new BABYLON.Color4(0.05, 0.06, 0.09, 1);

    // Adiciona uma câmera interativa (gira em torno do centro)
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50; // Suaviza o zoom do mouse

    // Adiciona uma luz global suave
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Criando um objeto de teste (Uma esfera dourada no centro)
    const esfera = BABYLON.MeshBuilder.CreateSphere("esferaCentro", { diameter: 2, segments: 32 }, scene);
    
    // Material da esfera
    const materialDourado = new BABYLON.StandardMaterial("dourado", scene);
    materialDourado.diffuseColor = new BABYLON.Color3(0.83, 0.68, 0.21); // Cor dourada
    esfera.material = materialDourado;
    
    // Levanta a esfera um pouco
    esfera.position.y = 1;

    return scene;
};

// Constrói a cena
const scene = createScene();

// Roda a cena continuamente (Render Loop)
engine.runRenderLoop(function () {
    scene.render();
});

// Ajusta o tamanho do 3D se o usuário redimensionar a tela do navegador
window.addEventListener("resize", function () {
    engine.resize();
});