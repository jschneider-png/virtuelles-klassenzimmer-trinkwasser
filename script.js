const storageKey = "wasser-lernportal-progress";
    let progress = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const moduleButtons = [...document.querySelectorAll("[data-module]")];
    const panels = [...document.querySelectorAll(".module-panel")];
    const welcome = document.getElementById("welcomePanel");

    function showModule(id) {
      welcome.style.display = "none";
      panels.forEach(p => p.classList.remove("active"));
      moduleButtons.forEach(b => b.classList.remove("active"));
      const panel = document.getElementById(id);
      if (panel) panel.classList.add("active");
      moduleButtons.filter(b => b.dataset.module === id).forEach(b => b.classList.add("active"));
      document.getElementById("workspace").scrollIntoView({behavior:"smooth", block:"start"});
      progress[id] = Math.max(progress[id] || 0, 25);
      saveProgress();
      renderProgress();
    }

    moduleButtons.forEach(btn => {
      btn.addEventListener("click", () => showModule(btn.dataset.module));
    });

    document.querySelectorAll(".mark-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.mark;
        progress[id] = 100;
        saveProgress();
        renderProgress();
        btn.textContent = "Bearbeitet ✓";
      });
    });

    function saveProgress() {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    }

    function renderProgress() {
      for(let i=1;i<=6;i++) {
        const id = "m" + i;
        const val = progress[id] || 0;
        document.getElementById("p"+i).style.width = val + "%";
        document.getElementById("t"+i).textContent = val + "%";
      }
    }

    // Accordion
    document.querySelectorAll(".accordion-item button").forEach(btn => {
      btn.addEventListener("click", () => btn.parentElement.classList.toggle("open"));
    });

    // Stepper Trinkwasser
    const stepTexts = {
      s1: "Rohwasser stammt z. B. aus Grundwasser, Quellen oder Talsperren. Es ist noch nicht automatisch als Trinkwasser geeignet.",
      s2: "Bei der Aufbereitung werden unerwünschte Stoffe entfernt oder reduziert. Je nach Wasserqualität kommen verschiedene Verfahren zum Einsatz.",
      s3: "Die Wasserqualität wird regelmäßig kontrolliert. Wichtige Messgrößen sichern die hygienische und chemische Qualität.",
      s4: "Anschließend wird das Trinkwasser über das Leitungsnetz an Haushalte, Schulen und Betriebe verteilt."
    };
    document.querySelectorAll(".step").forEach(step => {
      step.addEventListener("click", () => {
        document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
        step.classList.add("active");
        document.getElementById("stepContent").textContent = stepTexts[step.dataset.step];
      });
    });

    // Hotspots in Trinkwasser-Modul
    document.querySelectorAll(".hot-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        document.getElementById("hotTip").textContent = dot.dataset.tip;
        progress.m2 = Math.max(progress.m2 || 0, 75);
        saveProgress();
        renderProgress();
      });
    });

    // Drag and Drop Wasserhärte
    let dragged = null;
    document.querySelectorAll(".drag-item").forEach(item => {
      item.addEventListener("dragstart", () => dragged = item);
    });
    document.querySelectorAll(".drop-zone").forEach(zone => {
      zone.addEventListener("dragover", e => {
        e.preventDefault();
        zone.classList.add("over");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("over"));
      zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("over");
        if (!dragged) return;
        const correct = dragged.dataset.target === zone.dataset.zone;
        const fb = document.getElementById("dragFeedback");
        if(correct) {
          zone.appendChild(dragged);
          fb.textContent = "✅ Richtig zugeordnet.";
          fb.style.color = "#1e8c4c";
          progress.m3 = Math.max(progress.m3 || 0, 75);
        } else {
          fb.textContent = "↩️ Das passt noch nicht. Versuche es noch einmal.";
          fb.style.color = "#c04343";
        }
        saveProgress();
        renderProgress();
        dragged = null;
      });
    });

    // Quiz pH
    let selected = null;
    document.querySelectorAll(".choice").forEach(choice => {
      choice.addEventListener("click", () => {
        document.querySelectorAll(".choice").forEach(c => c.classList.remove("selected"));
        choice.classList.add("selected");
        selected = choice.dataset.answer;
      });
    });
    document.getElementById("checkQuizBtn").addEventListener("click", () => {
      const fb = document.getElementById("quizFeedback");
      if(!selected) {
        fb.textContent = "Bitte zuerst eine Antwort auswählen.";
        fb.style.color = "#bf7a08";
        return;
      }
      if(selected === "right") {
        fb.textContent = "✅ Richtig! Ein pH-Wert von 7 ist neutral.";
        fb.style.color = "#1e8c4c";
        progress.m4 = Math.max(progress.m4 || 0, 75);
      } else {
        fb.textContent = "❌ Noch nicht richtig. Denke an die Mitte der pH-Skala.";
        fb.style.color = "#c04343";
      }
      saveProgress();
      renderProgress();
    });
    document.getElementById("checkGap").addEventListener("click", () => {
      const val = document.getElementById("phGap").value.trim();
      const fb = document.getElementById("gapFeedback");
      if(val === "7") {
        fb.textContent = "✅ Genau – 7 ist neutral.";
        fb.style.color = "#1e8c4c";
        progress.m4 = 100;
      } else {
        fb.textContent = "❌ Tipp: Die neutrale Mitte der pH-Skala.";
        fb.style.color = "#c04343";
      }
      saveProgress();
      renderProgress();
    });

    // Flipcards TOC
    document.querySelectorAll(".flip").forEach(card => {
      card.addEventListener("click", () => {
        card.classList.toggle("flipped");
        progress.m5 = Math.max(progress.m5 || 0, 75);
        saveProgress();
        renderProgress();
      });
    });

    // Final quiz
    document.getElementById("evalFinalQuiz").addEventListener("click", () => {
      let score = 0;
      ["q1","q2","q3"].forEach(name => {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if(checked) score += Number(checked.value);
      });
      const fb = document.getElementById("finalFeedback");
      fb.textContent = `Du hast ${score} von 3 Punkten erreicht.`;
      fb.style.color = score >= 2 ? "#1e8c4c" : "#c04343";
      progress.m6 = score === 3 ? 100 : 75;
      saveProgress();
      renderProgress();
    });

    renderProgress();
