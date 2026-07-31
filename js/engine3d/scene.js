// js/engine3d/scene.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.05, 0.06, 0.09, 1);

    // Câmera que gira pelo cenário
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

    // Cria um painel flutuante (Formato de tela de cinema)
    const quadro = BABYLON.MeshBuilder.CreatePlane("quadroNatureza", {width: 16, height: 9}, scene);
    
    const materialNatureza = new BABYLON.StandardMaterial("materialNatureza", scene);
    
    // Puxa uma imagem aleatória de natureza (Picsum)
    const randomImageUrl = "https://picsum.photos/1280/720?nature&random=" + Math.random();
    
    materialNatureza.diffuseTexture = new BABYLON.Texture(randomImageUrl, scene);
    materialNatureza.specularColor = new BABYLON.Color3(0, 0, 0); // Tira o brilho de plástico
    materialNatureza.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Dá uma leve iluminada na foto
    
    quadro.material = materialNatureza;
    
    // Joga o quadro um pouco para o fundo para dar profundidade
    quadro.position.z = 2;

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => { scene.render(); });
window.addEventListener("resize", () => { engine.resize(); });