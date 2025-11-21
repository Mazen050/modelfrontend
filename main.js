const clusterInfo = {
    0: {status: "Low", mobility: "High", burden: "High"},
    1: {status: "Avg", mobility: "Low", burden: "Very Low"},
    2: {status: "Very High", mobility: "High", burden: "High"},
    3: {status: "Very High", mobility: "Low", burden: "High"},
    4: {status: "Low", mobility: "High", burden: "Low"},
    5: {status: "Low", mobility: "Low", burden: "High"},
    6: {status: "Avg", mobility: "High", burden: "Very Low"},
    7: {status: "Low", mobility: "Low", burden: "Low"},
};


function predict() {
    

    const RelationshipSatisfaction= Number(document.getElementById('RelationshipSatisfaction').value)
    const WorkLifeBalance= Number(document.getElementById('WorkLifeBalance').value)
    const YearsSinceLastPromotion= Number(document.getElementById('YearsSinceLastPromotion').value)
    const YearsAtCompany= Number(document.getElementById('YearsAtCompany').value)

    const DistanceFromHome = Number(document.getElementById('DistanceFromHome').value)
    const MonthlyIncome =  Number(document.getElementById('MonthlyIncome').value)

    const EnvironmentSatisfaction = Number(document.getElementById('EnvironmentSatisfaction').value)
    const JobSatisfaction = Number(document.getElementById('JobSatisfaction').value)

    console.log((DistanceFromHome)/MonthlyIncome)
    console.log("Predict button clicked");
    const data = {
        Age: Number(document.getElementById('Age').value),
        BusinessTravel: 1.0, ////////////////////

        DistanceFromHome: Number(document.getElementById('DistanceFromHome').value),
        JobLevel: Number(document.getElementById('JobLevel').value),
        MonthlyIncome: Number(document.getElementById('MonthlyIncome').value),
        NumCompaniesWorked: Number(document.getElementById('NumCompaniesWorked').value),
        OverTime: (document.getElementById('OverTime').value == "Yes"),
        PerformanceRating: Number(document.getElementById('PerformanceRating').value),

        "Department_Human Resources": (document.getElementById('Department').value == "Human Resources"),
        "Department_Research & Development": (document.getElementById('Department').value == "Research & Development"),
        Department_Sales: (document.getElementById('Department').value == "Sales"),

        "MaritalStatus_Divorced": (document.getElementById('MaritalStatus').value == "Divorced"),
        "MaritalStatus_Married": (document.getElementById('MaritalStatus').value == "Married"),
        "MaritalStatus_Single": (document.getElementById('MaritalStatus').value == "Single"),

        "PromotionLethargy": (YearsAtCompany - YearsSinceLastPromotion)/(YearsAtCompany+1),
        "HighDistanceLowPay": (DistanceFromHome)/MonthlyIncome,  
        "WorkLifeCommuteStrain": DistanceFromHome/WorkLifeBalance, 
        "OverallHappinessScore": (EnvironmentSatisfaction+JobSatisfaction+RelationshipSatisfaction)/3 
    };

    fetch("https://aggressive-tabitha-seasondownloader-77d70152.koyeb.app/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(pred => {
        if (pred.prediction === 1) {
            document.getElementById('status').innerText = clusterInfo[pred.cluster].status;
            document.getElementById('mobility').innerText = clusterInfo[pred.cluster].mobility;
            document.getElementById('burden').innerText = clusterInfo[pred.cluster].burden;
            document.querySelector(".cluster").style.display = "block";
            const pop = document.getElementById('popup');
            pop.style.display = "flex";
            animateTo(pred.probability);
        } else {
            const pop = document.getElementById('popup');
            pop.style.display = "flex";
            animateTo(pred.probability);
        }
    })
    .catch(err => {
        document.getElementById('result').innerHTML = "Error connecting to server.";
        console.error(err);
    });


}

// Canvas Gauge implementation
const canvas = document.getElementById('gauge');
const ctx = canvas.getContext('2d');
const centerX = canvas.width/2;
const centerY = canvas.height*0.95; // pivot near bottom
const radius = 150//110;

function drawGaugeBackground(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // track background (grey arc)
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.strokeStyle = '#eef2f7';
    ctx.arc(centerX, centerY, radius, Math.PI, 2*Math.PI, false);
    ctx.stroke();
}

function drawColoredArc(startPerc, endPerc){
    // startPerc and endPerc are 0..1 mapped to 180deg arc
    const startAngle = Math.PI + startPerc * Math.PI;
    const endAngle = Math.PI + endPerc * Math.PI;
    const grad = ctx.createLinearGradient(centerX-radius, centerY, centerX+radius, centerY);
    grad.addColorStop(0, '#18a558'); // green
    grad.addColorStop(0.5, '#ffcc00'); // yellow
    grad.addColorStop(1, '#d93131'); // red

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.stroke();
}

function drawTicks(){
    const tickRadius = radius + 14;
    ctx.strokeStyle = '#c6cbd6';
    for(let i=0;i<=10;i++){
    const angle = Math.PI + (i/10)*Math.PI;
    const x1 = centerX + Math.cos(angle)*(tickRadius-10);
    const y1 = centerY + Math.sin(angle)*(tickRadius-10);
    const x2 = centerX + Math.cos(angle)*(tickRadius+2);
    const y2 = centerY + Math.sin(angle)*(tickRadius+2);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineWidth=2; ctx.stroke();
    }
}

function drawNeedle(perc){
    // perc 0..1
    const angle = Math.PI + perc * Math.PI;
    const needleLen = radius - 18;

    // shadow
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle)*(needleLen+6), centerY + Math.sin(angle)*(needleLen+6));
    ctx.stroke();

    // main needle
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle)*needleLen, centerY + Math.sin(angle)*needleLen);
    ctx.stroke();

    // center circle
    ctx.beginPath(); ctx.fillStyle='#fff'; ctx.arc(centerX, centerY, 10,0,2*Math.PI); ctx.fill();
    ctx.beginPath(); ctx.fillStyle=('#0f172a'); ctx.arc(centerX, centerY, 4,0,2*Math.PI); ctx.fill();
}

function renderGauge(score){
    // score: 0..100
    const clamped = Math.max(0, Math.min(100, score));
    const perc = clamped/100;

    drawGaugeBackground();
    // colored arc from 0 to perc
    drawColoredArc(0, perc);
    drawTicks();
    drawNeedle(perc);

    document.getElementById('gaugeLabel').innerText = Math.round(clamped) + '%';
}

// initial render
renderGauge(0);

// animate from old to new
function animateTo(target){
    const start = parseFloat(document.getElementById('gaugeLabel').innerText) || 0;
    const duration = 900; // ms
    const startTime = performance.now();
    function step(now){
    const t = Math.min(1, (now - startTime)/duration);
    const eased = t<.5 ? 2*t*t : -1+(4-2*t)*t; // easeInOutQuad-ish
    const current = start + (target - start)*eased;
    renderGauge(current);
    if(t<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}



document.getElementById('closePopup').addEventListener('click', function() {
    const pop = document.getElementById('popup');
    pop.style.display = "none";
    document.querySelector(".cluster").style.display = "none";
    animateTo(0);
});
