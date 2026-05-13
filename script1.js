function showAlert() {
    alert("yoyoyoyoyoyoyoyoyoyoyoyo");
}

function calculate() {
    let result = 10 * 10;
    console.log("計算結果是：" + result);
    alert("計算結果已顯示在控制台：10 * 10 = " + result);
}

function changeColor() {
    const imageUrl = "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?q=80&w=1000&auto=format&fit=crop";
    
    document.body.style.backgroundImage = `url("${imageUrl}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundAttachment = "fixed";
    
    console.log("圖片已載入: " + imageUrl);
    alert("可愛的老鼠");
}