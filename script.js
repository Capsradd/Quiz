(function(){
  var lastJson='';

  var state={
    questions:[],
    currentIndex:0,
    answered:{},
    _results:[]
  };

  var $=function(id){return document.getElementById(id)};
  var landing=$('screen-landing'),home=$('screen-home'),quiz=$('screen-quiz'),result=$('screen-result'),flashcard=$('screen-flashcard');

  var jsonInput=$('json-input'),fileInput=$('file-input'),loadBtn=$('load-btn');
  var errorMsg=$('error-msg');
  var copyBtn=$('copy-btn'),copyPromptBtn=$('copy-prompt-btn'),homeBack=$('home-back');
  var landingQuiz=$('landing-quiz'),landingFlash=$('landing-flashcard');
  var homeTitle=$('home-title'),homeSubtitle=$('home-subtitle');

  // Quiz elements
  var qTitle=$('quiz-title'),qNum=$('question-num'),qText=$('question-text');
  var qProgressBar=$('progress-bar'),qProgressText=$('progress-text');
  var qHintArea=$('hint-area'),qHintToggle=$('hint-toggle'),qHintText=$('hint-text');
  var qOpts=$('options-container');
  var qBack=$('back-btn'),qNext=$('next-btn');
  var shareBtn=$('share-btn'),closeBtn=$('close-btn');
  var resultTitle=$('result-title'),resultSub=$('result-sub');
  var resultScore=$('result-score'),resultPct=$('result-pct');
  var redoBtn=$('redo-btn'),changeBtn=$('change-btn'),menuBtn=$('menu-btn');

  // Flashcard elements
  var fcTitle=$('fc-title'),fcQuestion=$('fc-question'),fcAnswer=$('fc-answer'),fcExplanation=$('fc-explanation');
  var fcCard=$('fc-card');
  var fcProgressBar=$('fc-progress-bar'),fcProgressText=$('fc-progress-text');
  var fcHintArea=$('fc-hint-area'),fcHintToggle=$('fc-hint-toggle'),fcHintText=$('fc-hint-text');
  var fcBack=$('fc-back'),fcNext=$('fc-next');
  var fcShare=$('fc-share'),fcClose=$('fc-close');

  function show(s){
    [landing,home,quiz,result,flashcard].forEach(function(x){x.classList.toggle('active',x===s)});
  }

  function showError(m){errorMsg.textContent=m;errorMsg.classList.remove('hidden')}
  function hideError(){errorMsg.classList.add('hidden');errorMsg.textContent=''}

  function validate(data,m){
    if(!data||typeof data!=='object'||Array.isArray(data))
      throw Error('Input harus berupa object JSON dengan field "title"');
    if(!data.title||typeof data.title!=='string'||!data.title.trim())
      throw Error('Field "title" tidak valid atau tidak ditemukan');

    if(m==='flashcard'){
      if(!Array.isArray(data.cards)) throw Error('Field "cards" harus berupa array');
      if(!data.cards.length) throw Error('Array "cards" kosong');
      data.cards.forEach(function(card,i){
        var n=i+1;
        if(!card.question||typeof card.question!=='string'||!card.question.trim())
          throw Error('Card nomor '+n+': field \'question\' tidak valid');
        if(!card.answer||typeof card.answer!=='string'||!card.answer.trim())
          throw Error('Card nomor '+n+': field \'answer\' tidak valid');
        if(card.explanation!==void 0&&(typeof card.explanation!=='string'))
          throw Error('Card nomor '+n+': field \'explanation\' harus string');
      });
    } else {
      if(!Array.isArray(data.questions))
        throw Error('Field "questions" harus berupa array');
      if(!data.questions.length) throw Error('Array "questions" kosong');
      data.questions.forEach(function(item,i){
        var n=i+1;
        if(!item.question||typeof item.question!=='string'||!item.question.trim())
          throw Error('Soal nomor '+n+': field \'question\' tidak valid');
        if(!Array.isArray(item.options)||item.options.length<2)
          throw Error('Soal nomor '+n+': \'options\' harus array minimal 2 opsi');
        var hasCorrect=false;
        item.options.forEach(function(opt,j){
          if(!opt.text||typeof opt.text!=='string')
            throw Error('Soal nomor '+n+', opsi ke-'+(j+1)+': field \'text\' tidak valid');
          if(opt.isCorrect===true) hasCorrect=true;
          if(typeof opt.isCorrect!=='boolean')
            throw Error('Soal nomor '+n+', opsi ke-'+(j+1)+': field \'isCorrect\' harus boolean');
        });
        if(!hasCorrect) throw Error('Soal nomor '+n+': harus ada minimal satu opsi dengan isCorrect: true');
      });
    }
  }

  function loadContent(str){
    hideError();
    var data;
    try{data=JSON.parse(str)}
    catch(e){showError('JSON tidak valid: '+e.message);return}
    try{validate(data,mode)}
    catch(e){showError(e.message);return}

    lastJson=str;

    if(mode==='quiz'){
      state.questions=data.questions;
      state.currentIndex=0;
      state.answered={};
      state._results=[];
      qTitle.textContent=data.title;
      show(quiz);
      renderQuestion();
    } else {
      state.questions=data.cards;
      state.currentIndex=0;
      fcTitle.textContent=data.title;
      show(flashcard);
      renderFlashcard();
    }
  }

  // ===== LANDING =====
  landingQuiz.addEventListener('click',function(){
    mode='quiz';
    homeTitle.textContent='Quiz Belajar';
    homeSubtitle.textContent='Paste JSON soal atau upload file .json';
    show(home);
  });
  landingFlash.addEventListener('click',function(){
    mode='flashcard';
    homeTitle.textContent='Flashcard Belajar';
    homeSubtitle.textContent='Paste JSON flashcard atau upload file .json';
    show(home);
  });
  homeBack.addEventListener('click',function(){
    lastJson='';
    jsonInput.value='';
    show(landing);
  });

  // ===== QUIZ =====
  function renderProgress(bar,text,total,cur){
    bar.innerHTML='';
    for(var i=0;i<total;i++){
      var seg=document.createElement('div');
      seg.className='progress-seg';
      if(i<cur) seg.classList.add('filled');
      else if(i===cur) seg.classList.add('active');
      else seg.classList.add('empty');
      bar.appendChild(seg);
    }
    text.textContent=(cur+1)+' / '+total;
  }

  function renderQuestion(){
    var q=state.questions[state.currentIndex];
    var total=state.questions.length;
    qNum.textContent='Question '+(state.currentIndex+1);
    qText.textContent=q.question;
    renderProgress(qProgressBar,qProgressText,total,state.currentIndex);

    if(q.hint&&q.hint.trim()){
      qHintArea.classList.remove('hidden');
      qHintText.textContent=q.hint;
      qHintText.classList.add('hidden');
      qHintToggle.textContent='+ Show Hint';
      qHintToggle.classList.remove('active');
    } else {
      qHintArea.classList.add('hidden');
    }

    qOpts.innerHTML='';
    var answered=state.answered[state.currentIndex]!==void 0;
    var selectedIdx=state.answered[state.currentIndex];

    q.options.forEach(function(opt,i){
      var letter=String.fromCharCode(65+i);
      var isCorrect=opt.isCorrect===true;
      var isSelected=i===selectedIdx;
      var isWrongSelected=isSelected&&!isCorrect;
      var showExplanation=answered&&isSelected&&opt.explanation;

      var card=document.createElement('div');
      card.className='option';
      if(answered){
        card.classList.add('locked');
        if(isCorrect) card.classList.add('correct');
        if(isWrongSelected) card.classList.add('wrong');
      }

      var row=document.createElement('div');
      row.className='option-row';

      var letterSpan=document.createElement('span');
      letterSpan.className='option-letter';
      letterSpan.textContent=letter+'.';
      row.appendChild(letterSpan);

      if(isWrongSelected){
        var badge=document.createElement('span');
        badge.className='option-badge your-answer';
        badge.textContent='(Your answer)';
        row.appendChild(badge);
      }

      var textSpan=document.createElement('span');
      textSpan.className='option-text';
      textSpan.textContent=opt.text;
      row.appendChild(textSpan);

      var checkIcon=document.createElement('span');
      checkIcon.className='option-icon icon-check';
      checkIcon.textContent='\u2713';
      row.appendChild(checkIcon);

      var xIcon=document.createElement('span');
      xIcon.className='option-icon icon-x';
      xIcon.textContent='\u2717';
      row.appendChild(xIcon);

      card.appendChild(row);

      if(showExplanation){
        var expl=document.createElement('div');
        expl.className='option-explanation';
        expl.textContent=opt.explanation;
        card.appendChild(expl);
      }

      if(!answered){
        card.addEventListener('click',function(){selectOption(i);});
        card.setAttribute('tabindex','0');
        card.setAttribute('role','button');
      }

      qOpts.appendChild(card);
    });

    qBack.disabled=state.currentIndex===0;
    qNext.disabled=!answered;
    qNext.textContent=state.currentIndex===total-1?'Finish':'Next';
  }

  function selectOption(idx){
    if(state.answered[state.currentIndex]!==void 0) return;
    state.answered[state.currentIndex]=idx;
    var q=state.questions[state.currentIndex];
    state._results[state.currentIndex]=q.options[idx].isCorrect===true;
    renderQuestion();
  }

  qHintToggle.addEventListener('click',function(){
    qHintText.classList.toggle('hidden');
    var show=!qHintText.classList.contains('hidden');
    qHintToggle.textContent=show?'- Hide Hint':'+ Show Hint';
    qHintToggle.classList.toggle('active',show);
  });

  qBack.addEventListener('click',function(){
    if(state.currentIndex>0){state.currentIndex--;renderQuestion()}
  });

  function showResult(prefix){
    resultTitle.textContent=prefix+' Selesai!';
    var total=state.questions.length;
    if(prefix==='Quiz'){
      resultSub.textContent='Skor kamu';
      var c=0;for(var k in state._results)if(state._results[k])c++;
      resultScore.textContent=c+' / '+total;
      resultPct.textContent=Math.round((c/total)*100)+'% benar';
    } else {
      resultSub.textContent='Kartu yang ditinjau';
      resultScore.textContent=total;
      resultPct.textContent='';
    }
    show(result);
  }

  qNext.addEventListener('click',function(){
    var total=state.questions.length;
    if(state.currentIndex<total-1){
      state.currentIndex++;
      renderQuestion();
    } else {
      showResult('Quiz');
    }
  });

  // ===== FLASHCARD =====
  function renderFlashcard(){
    var card=state.questions[state.currentIndex];
    var total=state.questions.length;
    fcQuestion.textContent=card.question;
    fcAnswer.textContent=card.answer;
    fcExplanation.textContent=card.explanation||'';
    fcExplanation.style.display=card.explanation?'block':'none';
    renderProgress(fcProgressBar,fcProgressText,total,state.currentIndex);

    fcCard.classList.remove('flipped');

    fcHintArea.classList.add('hidden');

    fcBack.disabled=state.currentIndex===0;
    var last=state.currentIndex===total-1;
    fcNext.textContent=last?'Done':'Next';
    fcNext.disabled=false;
  }

  fcCard.addEventListener('click',function(){
    if(state.questions.length) fcCard.classList.toggle('flipped')
  });

  fcBack.addEventListener('click',function(){
    if(state.currentIndex>0){
      state.currentIndex--;
      renderFlashcard();
    }
  });

  fcNext.addEventListener('click',function(){
    var total=state.questions.length;
    if(state.currentIndex<total-1){
      state.currentIndex++;
      renderFlashcard();
    } else {
      showResult('Flashcard');
    }
  });

  // FC hint unused in new schema but keep handlers for safety
  fcHintToggle.addEventListener('click',function(){});

  // ===== SHARED =====
  function goToLanding(){
    show(landing);
    state.questions=[];
    state.currentIndex=0;
    state.answered={};
    state._results=[];
    lastJson='';
    jsonInput.value='';
    hideError();
  }

  closeBtn.addEventListener('click',goToLanding);
  fcClose.addEventListener('click',goToLanding);

  shareBtn.addEventListener('click',function(){
    if(navigator.share){
      navigator.share({title:qTitle.textContent||'Quiz',url:location.href}).catch(function(){});
    } else {
      navigator.clipboard.writeText(location.href).then(function(){
        shareBtn.style.color='var(--correct-text)';
        setTimeout(function(){shareBtn.style.color=''},1500);
      }).catch(function(){});
    }
  });

  fcShare.addEventListener('click',function(){
    if(navigator.share){
      navigator.share({title:fcTitle.textContent||'Flashcard',url:location.href}).catch(function(){});
    } else {
      navigator.clipboard.writeText(location.href).then(function(){
        fcShare.style.color='var(--correct-text)';
        setTimeout(function(){fcShare.style.color=''},1500);
      }).catch(function(){});
    }
  });

  redoBtn.addEventListener('click',function(){
    if(lastJson) loadContent(lastJson);
  });

  changeBtn.addEventListener('click',function(){
    show(home);
    state.questions=[];
    state.currentIndex=0;
    state.answered={};
    state._results=[];
    lastJson='';
    jsonInput.value='';
    hideError();
  });

  menuBtn.addEventListener('click',function(){
    show(landing);
    state.questions=[];
    state.currentIndex=0;
    state.answered={};
    state._results=[];
    lastJson='';
    jsonInput.value='';
  });

  fileInput.addEventListener('change',function(){
    var file=this.files[0];
    if(!file) return;
    var reader=new FileReader;
    reader.onload=function(e){jsonInput.value=e.target.result;hideError()};
    reader.onerror=function(){showError('Gagal membaca file')};
    reader.readAsText(file);
  });

  loadBtn.addEventListener('click',function(){
    var s=jsonInput.value.trim();
    if(!s){showError('Silakan paste JSON atau upload file .json terlebih dahulu');return}
    loadContent(s);
  });

  copyBtn.addEventListener('click',function(){
    var example;
    if(mode==='flashcard'){
      example='{"title":"Flashcard SQL JOINs","cards":[{"question":"Apa fungsi JOIN dalam SQL?","answer":"Menggabungkan data dari dua atau lebih tabel","explanation":"JOIN menggabungkan kolom berdasarkan hubungan logis."},{"question":"Apa itu INNER JOIN?","answer":"Hanya baris yang cocok di kedua tabel","explanation":"INNER JOIN mengembalikan baris dengan nilai yang cocok di kedua tabel."},{"question":"Apa itu LEFT JOIN?","answer":"Semua baris dari tabel kiri, yang cocok dari kanan","explanation":"LEFT JOIN mengembalikan semua baris dari tabel kiri dan baris yang cocok dari tabel kanan."}]}';
    } else {
      example='{"title":"Kuis SQL JOINs: Memahami Penggabungan Tabel","mode":"quiz","questions":[{"question":"Apa fungsi utama dari JOIN dalam SQL?","options":[{"text":"Menggabungkan data dari dua atau lebih tabel","isCorrect":true,"explanation":"JOIN digunakan untuk menggabungkan kolom dari dua atau lebih tabel."},{"text":"Menghapus data dari tabel","isCorrect":false,"explanation":"Penghapusan data dilakukan dengan DELETE."},{"text":"Membuat tabel baru","isCorrect":false,"explanation":"Pembuatan tabel dilakukan dengan CREATE TABLE."},{"text":"Mengubah struktur tabel","isCorrect":false,"explanation":"Perubahan struktur tabel dilakukan dengan ALTER TABLE."}],"hint":"JOIN menggabungkan data."}]}';
    }
    navigator.clipboard.writeText(example).then(function(){
      copyBtn.textContent='Tersalin!';copyBtn.classList.add('copied');
      setTimeout(function(){copyBtn.textContent='Copy Contoh';copyBtn.classList.remove('copied')},2000);
    }).catch(function(){
      jsonInput.value=example;
      jsonInput.select();
    });
  });

  copyPromptBtn.addEventListener('click',function(){
    var example;
    if(mode==='flashcard'){
      example='Buatkan [isi jumlah soal] flashcard tentang [masukkan topik] dalam format JSON seperti contoh di bawah. Setiap kartu harus berisi pertanyaan, jawaban, dan penjelasan singkat. Gunakan bahasa Indonesia.\n\nContoh format:\n{\n  "title": "Flashcard [topik]",\n  "cards": [\n    {\n      "question": "Pertanyaan 1?",\n      "answer": "Jawaban 1",\n      "explanation": "Penjelasan 1"\n    },\n    {\n      "question": "Pertanyaan 2?",\n      "answer": "Jawaban 2",\n      "explanation": "Penjelasan 2"\n    }\n  ]\n}';
    } else {
      example='Buatkan [isi jumlah soal] soal quiz tentang [masukkan topik] dalam format JSON seperti contoh di bawah. Setiap soal harus memiliki 4 opsi pilihan ganda dengan satu jawaban benar, plus penjelasan untuk opsi yang benar. Gunakan bahasa Indonesia.\n\nContoh format:\n{\n  "title": "Kuis [topik]",\n  "questions": [\n    {\n      "question": "Pertanyaan?",\n      "options": [\n        {"text": "Opsi A", "isCorrect": true, "explanation": "Penjelasan A"}, \n        {"text": "Opsi B", "isCorrect": false, "explanation": "Penjelasan B"},\n        {"text": "Opsi C", "isCorrect": false, "explanation": "Penjelasan C"},\n        {"text": "Opsi D", "isCorrect": false, "explanation": "Penjelasan D"}\n      ],\n      "hint": "Petunjuk"\n    }\n  ]\n}';
    }
    navigator.clipboard.writeText(example).then(function(){
      copyPromptBtn.textContent='Tersalin!';copyPromptBtn.classList.add('copied');
      setTimeout(function(){copyPromptBtn.textContent='Copy Contoh with Prompt';copyPromptBtn.classList.remove('copied')},2000);
    }).catch(function(){
      jsonInput.value=example;
      jsonInput.select();
    });
  });

  jsonInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();loadBtn.click()}
  });
})();
