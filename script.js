(function(){
  "use strict";
  function Quiz() {
    var ACTIVE_ATTR = "aria-active";
    var QUIZ_ATTR = "data-quiz-parent";
    var QUESTION_ATTR = "data-quiz-question-id";
    var QUESTION_VAL = "data-quiz-question-value";
    var ANSWER_ATTR = "data-quiz-answer";
    var MULTIPLE_ID_ATTR = "data-quiz-multiple-id";
    var MULTIPLE_ATTR = "data-quiz-multiple";
    var PREV_ATTR = "data-quiz-previous-question";
    var FORK_ATTR = "data-quiz-fork";
    var FORK_BTN_ATTR = "data-quiz-fork-answer";
    var NEXT_ATTR = "data-quiz-next";
    var RESULTS_ATTR = "data-quiz-results";
    var RESULTS_SUM = "data-quiz-sum";
    var RESULTS_DISPLAY_ATTR = "data-quiz-results-display";
    var RESTART_ATTR = "data-quiz-restart";
    var RETURN_ATTR = "data-quiz-return";
    var TOTAL = 53
    var answers = [];
    
    function setActive(card) {
      card.setAttribute(ACTIVE_ATTR, "true");
      card.setAttribute("tabindex", "0");
    }
    
    function setInactive(card) {
      card.setAttribute(ACTIVE_ATTR, "false");
      card.setAttribute("tabindex", "-1");
    }

    function registerAnswer(question, answer) {
      answers.push([question, answer])
    }

    function prevQuestion(current, prev) {
      current.setAttribute(PREV_ATTR, "0");
      setInactive(current);
      setActive(prev);
      answers[current.getAttribute(QUESTION_ATTR)] = null;
      delete answers[current.getAttribute(QUESTION_ATTR)];
    }

    function nextQuestion(current, next) {
      setInactive(current);
      if (!next) { return; }
      setActive(next);
      next.setAttribute(PREV_ATTR, current.getAttribute(QUESTION_ATTR));
      
      var nextFork = next.getAttribute(FORK_ATTR);
      if (!nextFork) { return; }
      var nextForkList = nextFork.split(';');
      for (var f = 0; f < nextForkList.length; f++) {
        var thisFork = nextForkList[f].split(':');
        if (thisFork[0] == current.getAttribute(PREV_ATTR)) {
          next.querySelector("["+FORK_BTN_ATTR+"]").setAttribute(ANSWER_ATTR, thisFork[1]);
        }
      }
    }

    function quizReset(quizParent) {
      answers = {};
      nextQuestion(
        quizParent.querySelector("[" + RESULTS_ATTR + "]"),
        quizParent.querySelector("[" + QUESTION_ATTR + '="1"]')
      );
      var checkboxes = quizParent.querySelectorAll('input[type="checkbox"]');
      for (var c = 0; c < checkboxes.length; c++) {
        checkboxes[c].checked = false;
      }
      }
    function riskCalculation() {
        var positive = 0;
        for (var a = 0; a < answers.length; a++) {
            if (typeof answers[a][1] === 'object' && answers[a][1] !== null) {
                for (var key in answers[a][1]) {
                    if (answers[a][1].hasOwnProperty(key)) {
                        if (answers[a][1][key] == true) {
                            positive++;
                        }

                    }
                }
            }
            else {
                if (answers[a][1] == "Yes") {
                    positive++;

                };
            };
        }
        console.log("end", positive)
        var risk_percent = Math.round((positive / TOTAL) * 100);
        return risk_percent;
    }

    function quizAction(e) {
      var prevBtn = e.target.closest("[" + RETURN_ATTR + "]");
      var answerBtn = e.target.closest("[" + ANSWER_ATTR + "]");
      var currentCard = e.target.closest("[" + QUESTION_ATTR + "]");
      var resetBtn = e.target.closest("[" + RESTART_ATTR + "]");

      if (resetBtn) {
        quizReset(e.target.closest("[" + QUIZ_ATTR + "]"));
        return;
      }

      if (!answerBtn && !resetBtn && !prevBtn) { return; }

      if (prevBtn) {
        prevQuestion(
          prevBtn.closest("["+ QUESTION_ATTR +"]"),
          prevBtn.closest("[" + QUIZ_ATTR + "]").querySelector("["+ QUESTION_ATTR +"='" + currentCard.getAttribute(PREV_ATTR) + "']")
        );

        return;
      }

        
        var currentQuestionId = currentCard.querySelector('[' + QUESTION_VAL + ']').innerHTML;
        
        var answerValue = answerBtn.innerHTML;
        if (answerBtn.getAttribute(ANSWER_ATTR) === "multiple") {
            var answerObject = {};
            var answerGroup = currentCard.querySelectorAll('[' + MULTIPLE_ATTR + '="' + answerBtn.getAttribute(MULTIPLE_ID_ATTR) + '"]');
            for (var a = 0; a < answerGroup.length; a++) {
                answerObject[answerGroup[a].name] = answerGroup[a].checked;
            }
            var answerValue = answerObject;
        }
        else {
            var answerValue = answerBtn.innerHTML;
            
        }

        var nextQuestionId = answerBtn.getAttribute(NEXT_ATTR);
        var nextCard =
            currentCard.closest("[" + QUIZ_ATTR + "]")
                .querySelector('[' + (
                    nextQuestionId === "results"
                        ? RESULTS_ATTR
                        : QUESTION_ATTR + '="' + parseInt(nextQuestionId, 10) + '"'
                ) + ']');
        registerAnswer(currentQuestionId, answerValue);
        if (nextQuestionId === 'results') {
            var risk_val = riskCalculation()
            var level = "LOW"
            if (risk_val <= 34) { level = "LOW"; };
            if ((risk_val > 34) && (risk_val <= 68)) { level = "MEDIUM"; };
            if ((risk_val > 69) && (risk_val <= 100)) { level = "HIGH"; };
            nextCard.querySelector('[' + RESULTS_SUM + ']').innerHTML = "Based on your results, you marked " + "<b>" + risk_val + "</b>" + "% of your answers as yes, indicating a " + "<b>" + level
                + "</b>" + " risk the person is a victim of Human Trafficking";
            nextCard.querySelector('[' + RESULTS_DISPLAY_ATTR + ']').innerHTML = '<pre style="text-align:left;">' + JSON.stringify(answers, null, 2) + '</pre>';



        }
        nextQuestion(currentCard, nextCard);
    }

    this.init = function() {
      document.addEventListener("click", function(e) {
          quizAction(e);
          console.log(answers);
        }.bind(this));
    };
  }

  document.addEventListener("DOMContentLoaded", function() {
    var quiz = new Quiz();
    quiz.init();
  });
})();
