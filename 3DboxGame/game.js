// 初始化場景
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2);

let boxes = []; // 存儲方塊的數組
let outlines = []; // 存儲邊框的數組

// 添加攝影機
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

function createRandomCubes(count) {
    // 清除現有的方塊和邊框
    boxes.forEach(box => box.dispose());
    outlines.forEach(outline => outline.dispose());
    boxes = [];
    outlines = [];

    // 使用 Map 來儲存位置，便於查詢
    const positions = new Map();
    
    // 起始位置
    const startingPoint = { x: 0, y: 0, z: 0 };
    positions.set(positionToKey(startingPoint), startingPoint);
    createBoxWithOutline(new BABYLON.Vector3(0, 0, 0));

    // 方向數組，用於隨機選擇
    const directions = [
        { x: 1, y: 0, z: 0 },  // 右
        { x: -1, y: 0, z: 0 }, // 左
        { x: 0, y: 1, z: 0 },  // 上
        { x: 0, y: -1, z: 0 }, // 下
        { x: 0, y: 0, z: 1 },  // 前
        { x: 0, y: 0, z: -1 }  // 後
    ];

    // 已生成的方塊數（包括起始方塊）
    let placedCubes = 1;

    while (placedCubes < count) {
        // 從已有的位置中隨機選擇一個
        const existingPositions = Array.from(positions.values());
        const basePosition = existingPositions[Math.floor(Math.random() * existingPositions.length)];

        // 獲取所有可能的相鄰位置
        const validPositions = [];
        
        // 檢查六個方向
        for (const dir of directions) {
            const newPos = {
                x: basePosition.x + dir.x,
                y: basePosition.y + dir.y,
                z: basePosition.z + dir.z
            };
            
            // 檢查新位置是否已被占用
            const posKey = positionToKey(newPos);
            if (!positions.has(posKey)) {
                // 確認至少有一個相鄰的已存在方塊
                let hasNeighbor = false;
                for (const checkDir of directions) {
                    const neighborPos = {
                        x: newPos.x + checkDir.x,
                        y: newPos.y + checkDir.y,
                        z: newPos.z + checkDir.z
                    };
                    const neighborKey = positionToKey(neighborPos);
                    
                    if (positions.has(neighborKey)) {
                        hasNeighbor = true;
                        break;
                    }
                }
                
                if (hasNeighbor) {
                    validPositions.push(newPos);
                }
            }
        }

        // 如果找到有效位置
        if (validPositions.length > 0) {
            // 隨機選擇一個有效位置
            const newPosition = validPositions[Math.floor(Math.random() * validPositions.length)];
            positions.set(positionToKey(newPosition), newPosition);
            createBoxWithOutline(new BABYLON.Vector3(newPosition.x, newPosition.y, newPosition.z));
            placedCubes++;
        } else {
            console.warn("無法在當前位置找到有效的相鄰位置，嘗試其他起始點");
            // 繼續下一次迭代，嘗試從其他已有方塊擴展
        }
    }
}

// 輔助函數：將位置轉換為唯一的字符串鍵值
function positionToKey(pos) {
    return `${pos.x},${pos.y},${pos.z}`;
}

function createBoxWithOutline(position) {
    // 創建主方塊
    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
    box.position = position;
    boxes.push(box); // 添加方塊到數組

    const outlinePoints = [
        new BABYLON.Vector3(-0.5, -0.5, -0.5), // 0
        new BABYLON.Vector3(0.5, -0.5, -0.5),  // 1
        new BABYLON.Vector3(0.5, -0.5, 0.5),   // 2
        new BABYLON.Vector3(-0.5, -0.5, 0.5),  // 3
        new BABYLON.Vector3(-0.5, -0.5, -0.5), // 0
        new BABYLON.Vector3(-0.5, 0.5, -0.5),  // 4
        new BABYLON.Vector3(0.5, 0.5, -0.5),   // 5
        new BABYLON.Vector3(0.5, -0.5, -0.5),  // 1
        new BABYLON.Vector3(0.5, 0.5, -0.5),   // 5
        new BABYLON.Vector3(0.5, 0.5, 0.5),    // 6
        new BABYLON.Vector3(0.5, -0.5, 0.5),   // 2
        new BABYLON.Vector3(0.5, 0.5, 0.5),    // 6
        new BABYLON.Vector3(-0.5, 0.5, 0.5),   // 7
        new BABYLON.Vector3(-0.5, -0.5, 0.5),  // 3
        new BABYLON.Vector3(-0.5, 0.5, 0.5),   // 7
        new BABYLON.Vector3(-0.5, 0.5, -0.5),  // 4
    ];

    // 創建邊框（線框）
    const outline = BABYLON.MeshBuilder.CreateLines("outline", { points: outlinePoints }, scene);
    outline.position = position; // 將邊框設置到方塊的位置
    outline.color = new BABYLON.Color3(1, 0, 0); // 設置邊框顏色（紅色）

    // 設置邊框粗細
    outline.enableEdgesRendering(); // 啟用邊緣渲染
    outline.edgesColor = new BABYLON.Color4(1, 0, 0, 1); // 邊緣顏色
    outline.edgesWidth = 4; // 邊緣寬度（增加數值來變粗）

    outlines.push(outline); // 將邊框添加到數組中
    return box;
}

// 生成方塊的初始數量
createRandomCubes(10); // 生成10個隨機方塊

// 事件監聽器：重新生成方塊
document.getElementById("generateButton").addEventListener("click", () => {
    const count = parseInt(document.getElementById("boxCount").value);
    createRandomCubes(count); // 生成指定數量的方塊
});

// 添加環境光
const hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
hemisphericLight.intensity = 0.5; // 設置環境光的強度

// 創建點光源
const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 10, 0), scene);
light.intensity = 1; // 初始強度

// 更新光源強度
document.getElementById("updateLightButton").addEventListener("click", () => {
    const intensity = parseFloat(document.getElementById("lightIntensity").value);
    light.intensity = intensity; // 更新光源強度
});

// 隨機重新生成光源位置
document.getElementById("randomLightPositionButton").addEventListener("click", () => {
    const randomX = (Math.random() - 0.5) * 20; // 隨機X坐標
    const randomY = (Math.random() - 0.5) * 20; // 隨機Y坐標
    const randomZ = (Math.random() - 0.5) * 20; // 隨機Z坐標
    light.position = new BABYLON.Vector3(randomX, randomY, randomZ); // 更新光源位置
});

// 渲染循環
engine.runRenderLoop(() => {
    scene.render();
});

// 處理畫布大小改變
window.addEventListener("resize", () => {
    engine.resize();
});
