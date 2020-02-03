(function(){
  "use strict";
  function Quiz() {
    var ACTIVE_ATTR = "aria-active";
    var QUIZ_ATTR = "data-quiz-parent";
    var QUESTION_ATTR = "data-quiz-question-id";
    var ANSWER_ATTR = "data-quiz-answer";
    var MULTIPLE_ID_ATTR = "data-quiz-multiple-id";
    var MULTIPLE_ATTR = "data-quiz-multiple";
    var PREV_ATTR = "data-quiz-previous-question";
    var FORK_ATTR = "data-quiz-fork";
    var FORK_BTN_ATTR = "data-quiz-fork-answer";
    var NEXT_ATTR = "data-quiz-next";
    var RESULTS_ATTR = "data-quiz-results";
    var RESULTS_DISPLAY_ATTR = "data-quiz-results-display";
    var RESTART_ATTR = "data-quiz-restart";
    var RETURN_ATTR = "data-quiz-return";
    var answers = {};
    
    function setActive(card) {
      card.setAttribute(ACTIVE_ATTR, "true");
      card.setAttribute("tabindex", "0");
    }
    
    function setInactive(card) {
      card.setAttribute(ACTIVE_ATTR, "false");
      card.setAttribute("tabindex", "-1");
    }

    function registerAnswer(question, answer) {
      answers[question] = answer;
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

      var currentQuestionId = parseInt(currentCard.getAttribute(QUESTION_ATTR), 10);

      if (answerBtn.getAttribute(ANSWER_ATTR) === "multiple") {
        var answerObject = {};
        var answerGroup = currentCard.querySelectorAll('[' + MULTIPLE_ATTR + '="' + answerBtn.getAttribute(MULTIPLE_ID_ATTR) + '"]');
        for (var a = 0; a < answerGroup.length; a++) {
          answerObject[answerGroup[a].name] = answerGroup[a].checked;
        }
        var answerValue = answerObject;
      }
      else {
      	var answerValue = parseInt(answerBtn.getAttribute(ANSWER_ATTR), 10) === 1 ? true : false; // Yes == 1 == true / No == 0 == false
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