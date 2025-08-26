// -----------------------------
// بيانات الفرق (مَحفوظة من عند المستخدم)
// أعدت كتابتهم بحروف عادية (حافظت على الاحرف الكبيرة)
const initialTeams = [
  "REAL MADRID",
  "ATLETICO MADRID",
  "FC BARCELONA",
  "VILLARREAL",
  "SEVILLA",
  "MAN UTD",
  "LIVERPOOL",
  "MANCITY",
  "TOTTENHAM",
  "NEWCASTLE UNITED",
  "ARSENAL",
  "CHELSEA",
  "AC MILAN",
  "INTER MILAN",
  "ROMA",
  "JUVENTUS",
  "NAPOLI",
  "BAYERN MUNCHEN",
  "LEVERKUSEN",
  "DORTMUND",
  "PSG",
  "MARSEILLE",
  "MONACO",
  "AL NASR",
  "AL HILAL",
  "SPORTING LISBON",
  "BENFICA",
  "AJAX",
  "PSV",
  "FLAMENGO",
  "RIVER PLATE",
  "NOTTINGHAM FOREST"
];

// ---- إعداد البطولة ----
// rounds: array من المراحل. كل مرحلة هي قائمة مباريات.
// كل مباراة هو كائن: {teamA, teamB, scoreA, scoreB, decided}
let rounds = []; // سنبنيها ديناميكياً بناءً على الفرق

const roundsNames = [
  "دور الـ 32",
  "دور الـ 16",
  "ربع النهائي",
  "نصف النهائي",
  "النهائي"
];

const teamsListEl = document.getElementById("teamsList");
const bracketArea = document.getElementById("bracketArea");
const champCard = document.getElementById("champion");
const shuffleBtn = document.getElementById("shuffleBtn");
const resetBtn = document.getElementById("resetBtn");

// ---- دوال مساعدة ----
function chunkArray(arr, size){
  const out=[];
  for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size));
  return out;
}

function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

// يخلط مصفوفة
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// ---- إنشاء الهيكل (من الفرق) ----
function initRounds(teams){
  // نتوقع 32 فرق => عدد مباريات الجولة الأولى = 16
  const firstRoundMatches = [];
  for(let i=0;i<teams.length;i+=2){
    firstRoundMatches.push({
      teamA: teams[i]||"—",
      teamB: teams[i+1]||"—",
      scoreA: null,
      scoreB: null,
      decided: false
    });
  }
  rounds = [firstRoundMatches];

  // باقي الجولات: كل جولة نصف عدد مباريات الجولة قبل
  let matches = firstRoundMatches.length;
  while(matches > 1){
    matches = Math.floor(matches/2);
    const emptyRound = Array.from({length:matches}).map(()=>({
      teamA: "—", teamB: "—", scoreA:null, scoreB:null, decided:false
    }));
    rounds.push(emptyRound);
  }
  renderAll();
}

// ---- عرض لائحة الفرق ----
function renderTeamsList(teams){
  teamsListEl.innerHTML = "";
  teams.forEach((t,i)=>{
    const li = document.createElement("li");
    li.textContent = `${i+1}. ${t}`;
    teamsListEl.appendChild(li);
  });
}

// ---- عرض الـ bracket كامل ----
function renderAll(){
  renderTeamsList(currentTeams);
  bracketArea.innerHTML = "";
  const roundsContainer = document.createElement("div");
  roundsContainer.className = "rounds";

  rounds.forEach((rnd, roundIndex)=>{
    const roundEl = document.createElement("div");
    roundEl.className = "round";
    const title = document.createElement("h3");
    title.textContent = roundsNames[roundIndex] || `الجولة ${roundIndex+1}`;
    roundEl.appendChild(title);

    rnd.forEach((m, matchIndex)=>{
      const matchEl = createMatchElement(m, roundIndex, matchIndex);
      roundEl.appendChild(matchEl);
    });

    roundsContainer.appendChild(roundEl);
  });

  bracketArea.appendChild(roundsContainer);
  updateChampion();
}

// ---- إنشاء عنصر مباراة واحد ----
function createMatchElement(match, roundIndex, matchIndex){
  const wrap = document.createElement("div");
  wrap.className = "match";
  
  // فريق A
  const rowA = document.createElement("div");
  rowA.className = "team-row";
  const nameA = document.createElement("div");
  nameA.className = "team-name";
  nameA.title = match.teamA;
  nameA.textContent = match.teamA;
  const inputA = document.createElement("input");
  inputA.type = "number"; 
  inputA.min = 0; 
  inputA.className = "input-score";
  inputA.placeholder = "-"; 
  if (match.scoreA !== null) inputA.value = match.scoreA;

  rowA.appendChild(nameA); 
  rowA.appendChild(inputA);

  // فريق B
  const rowB = document.createElement("div");
  rowB.className = "team-row";
  const nameB = document.createElement("div");
  nameB.className = "team-name";
  nameB.title = match.teamB;
  nameB.textContent = match.teamB;
  const inputB = document.createElement("input");
  inputB.type = "number"; 
  inputB.min = 0; 
  inputB.className = "input-score";
  inputB.placeholder = "-"; 
  if (match.scoreB !== null) inputB.value = match.scoreB;

  rowB.appendChild(nameB); 
  rowB.appendChild(inputB);

  // أزرار تأكيد و مسح
  const actions = document.createElement("div");
  actions.className = "match-actions";
  const confirmBtn = document.createElement("button");
  confirmBtn.className = "btn-confirm";
  confirmBtn.textContent = "تأكيد";
  const clearBtn = document.createElement("button");
  clearBtn.className = "btn-clear";
  clearBtn.textContent = "مسح";

  actions.appendChild(clearBtn); 
  actions.appendChild(confirmBtn);

  wrap.appendChild(rowA);
  wrap.appendChild(rowB);
  wrap.appendChild(actions);

  // إن كان التعادل مسموح؟ لا — يجب تحديد فائز: في حالة تعادل، نعتبر الفريق الأيسر الفائز بشكل افتراضي
  confirmBtn.addEventListener("click", ()=>{
    const aVal = inputA.value.trim();
    const bVal = inputB.value.trim();
    if(aVal === "" || bVal === ""){
      alert("يرجى إدخال النتيجة للجانبين أولاً");
      return;
    }
    const a = parseInt(aVal,10);
    const b = parseInt(bVal,10);
    if(Number.isNaN(a) || Number.isNaN(b) || a < 0 || b < 0){
      alert("يرجى إدخال نتيجة صالحة (0 أو أكثر)");
      return;
    }

    // تحديث البيانات في المصفوفة
    match.scoreA = a; 
    match.scoreB = b;
    match.decided = true;

    // تحديد الفائز (لو تعادل -> نفتح نافذة لتحديد الفائز يدوياً)
    if(a === b){
      // نعطي المستخدم خيار: ضربات ترجيح؟ هنا نطلب اختيار يدوياً
      const pick = confirm("النتيجة تعادل. اضغط موافق لتعيين الفريق الأول فائز، أو إلغاء لتعيين الفريق الثاني فائز.");
      if(pick) advanceWinner(roundIndex, matchIndex, "A");
      else advanceWinner(roundIndex, matchIndex, "B");
    } else {
      const winner = a > b ? "A" : "B";
      advanceWinner(roundIndex, matchIndex, winner);
    }

    // تلوين الفائز
    markWinnerVisual(wrap, match);
  });

  // مسح النتيجة
  clearBtn.addEventListener("click", ()=>{
    match.scoreA = null; 
    match.scoreB = null; 
    match.decided = false;
    // أيضًا يجب ازالة أي تقدم سابق من الجولات الأعلى اعتماداً على هذه المباراة
    removeAdvancementFrom(roundIndex, matchIndex);
    renderAll();
  });

  // إظهار تمييز إن كان هناك فائز
  if(match.decided){
    markWinnerVisual(wrap, match);
  }

  return wrap;
}

// علامة على الفائز داخل واجهة المباراة
function markWinnerVisual(matchEl, match){
  // إزالة أي فئات
  Array.from(matchEl.querySelectorAll(".team-row")).forEach(r=>r.classList.remove("winner"));
  const rows = matchEl.querySelectorAll(".team-row");
  if(match.scoreA === null || match.scoreB === null) return;
  if(match.scoreA > match.scoreB){
    rows[0].classList.add("winner");
  } else if(match.scoreB > match.scoreA){
    rows[1].classList.add("winner");
  } else {
    // تعادل مع افتراض تم اختيار الفائز — لازم أن ننفذ المنطق في advanceWinner لضبط هذا
  }
}

// ترقية الفائز إلى الجولة التالية
function advanceWinner(roundIndex, matchIndex, winnerAB){
  if(roundIndex === rounds.length - 1){
    // إن كانت هذه آخر جولة (النهائي)، نعرض البطل
    const finalMatch = rounds[roundIndex][matchIndex];
    const champ = winnerAB === "A" ? finalMatch.teamA : finalMatch.teamB;
    champCard.textContent = champ;
    return;
  }

  // حدد اسم الفائز
  const currentMatch = rounds[roundIndex][matchIndex];
  const winnerName = winnerAB === "A" ? currentMatch.teamA : currentMatch.teamB;

  // أين نضع الفائز في الجولة التالية؟
  const nextRound = rounds[roundIndex+1];
  const targetMatchIdx = Math.floor(matchIndex / 2); // أي مباراة
  const slot = (matchIndex % 2 === 0) ? "teamA" : "teamB"; // حتى/فردي

  // ضع الفائز
  nextRound[targetMatchIdx][slot] = winnerName;
  // نظف نتائج تلك المباراة الهدفية لأن الفريق الجديد قد يغيرها لاحقاً
  nextRound[targetMatchIdx].scoreA = null;
  nextRound[targetMatchIdx].scoreB = null;
  nextRound[targetMatchIdx].decided = false;

  // أيضا، لو سبق وضع فائز من مباراة ثانية في نفس المكان، لا نمسحها (سيتبدل لو وضعت نتيجة لاحقاً)
  // تحديث العرض
  renderAll();
}

// عند مسح نتيجة مباراة، يجب إزالة أي تقدم أعمدة أعلى الذي بني عليه
function removeAdvancementFrom(roundIndex, matchIndex){
  // نمر على كل الجولات الأعلى ونمسح المكان الذي تأثر
  let idx = matchIndex;
  for(let r = roundIndex+1; r < rounds.length; r++){
    const targetIdx = Math.floor(idx / 2);
    // نظف محتوى المباراة الهدف
    rounds[r][targetIdx].teamA = "—";
    rounds[r][targetIdx].teamB = "—";
    rounds[r][targetIdx].scoreA = null;
    rounds[r][targetIdx].scoreB = null;
    rounds[r][targetIdx].decided = false;
    idx = targetIdx;
  }
  // تفرغ البطل إن كانت مرتبطة
  champCard.textContent = "—";
}

// تحديث البطاقة العليا (البطل) وفق حالة النهائي
function updateChampion(){
  const lastRound = rounds[rounds.length-1];
  if(!lastRound) { 
    champCard.textContent = "—"; 
    return; 
  }
  const finalMatch = lastRound[0];
  if(finalMatch && finalMatch.decided){
    // من الممكن أننا لم نُحدث البطل عبر advanceWinner إن كانت النهاية يدوية
    if(finalMatch.scoreA !== null && finalMatch.scoreB !== null){
      champCard.textContent = finalMatch.scoreA > finalMatch.scoreB ? finalMatch.teamA : finalMatch.teamB;
    }
  } else {
    champCard.textContent = "—";
  }
}

// ---- تهيئة التشغيل ----
let currentTeams = shuffle(initialTeams); // ابدأ مخلوط — يمكن إعادة القرعة
initRounds(currentTeams);

// زر إعادة القرعة (خلط الفرق ثم إعادة ضبط)
shuffleBtn.addEventListener("click", ()=>{
  if(!confirm("هل تريد حقاً إجراء قرعة جديدة؟ هذا سيمسح أي نتائج مدخلة حالياً.")) return;
  currentTeams = shuffle(initialTeams);
  initRounds(currentTeams);
});

// زر إعادة ضبط البطولات (يعيد نفس الترتيب الأصلي الحالي بدون خلط)
resetBtn.addEventListener("click", ()=>{
  if(!confirm("هل تريد إعادة ضبط كامل البطولة؟")) return;
  currentTeams = currentTeams.slice(); // نفس الترتيب الحالي
  initRounds(currentTeams);
});

// دالة للحفظ في Firebase (إضافة جديدة)
async function saveTournamentData() {
  try {
    const tournamentData = {
      teams: currentTeams,
      rounds: rounds,
      lastUpdated: new Date()
    };
    
    // حفظ البيانات في Firebase
    // (يجب استيراد دوال Firebase أولاً)
    const docRef = await addDoc(collection(db, "tournaments"), tournamentData);
    console.log("تم حفظ البيانات بنجاح، المعرف: ", docRef.id);
    return true;
  } catch (error) {
    console.error("خطأ في حفظ البيانات: ", error);
    return false;
  }
}

// دالة لتحميل البيانات من Firebase (إضافة جديدة)
async function loadTournamentData() {
  try {
    const querySnapshot = await getDocs(collection(db, "tournaments"));
    if (!querySnapshot.empty) {
      // نأخذ أحدث وثيقة
      const latestDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      const data = latestDoc.data();
      
      currentTeams = data.teams;
      rounds = data.rounds;
      
      renderAll();
      console.log("تم تحميل البيانات بنجاح");
      return true;
    }
  } catch (error) {
    console.error("خطأ في تحميل البيانات: ", error);
    return false;
  }
}

// إضافة أزرار الحفظ والتحميل لواجهة المستخدم (إضافة جديدة)
function addSaveLoadButtons() {
  const controlsDiv = document.querySelector('.controls');
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = 'حفظ البطولة';
  saveBtn.addEventListener('click', saveTournamentData);
  
  const loadBtn = document.createElement('button');
  loadBtn.className = 'btn btn-primary';
  loadBtn.textContent = 'تحميل البطولة';
  loadBtn.addEventListener('click', loadTournamentData);
  
  controlsDiv.appendChild(saveBtn);
  controlsDiv.appendChild(loadBtn);
}

// تهيئة Firebase (إضافة جديدة)
function initFirebase() {
  // التهيئة موجودة في HTML
  console.log("Firebase جاهز للاستخدام");
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  initFirebase();
  addSaveLoadButtons();
});
