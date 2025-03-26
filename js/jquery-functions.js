$(document).ready(function () {
  let currentQuestion = 0;
  let totalQuestions = 0;
  let allQuestions = [];
  let userAnswers = {};

  // Κρύβουμε τα κουμπιά ερωτήσεων μέχρι να πατηθεί "Ας ξεκινήσουμε"
  $("#questions-btns").hide();
  $("#nextQuestion").hide();
  $("#backButton").hide();

  // 1. Φόρτωση JSON ερωτήσεων (all-questions-school.json)
  function loadQuestionsData() {
    return fetch("question-utils/all-questions-school.json")
      .then((response) => response.json())
      .then((data) => {
        allQuestions = data;
        totalQuestions = data.length;
      })
      .catch((error) => {
        console.error("Σφάλμα στη φόρτωση των ερωτήσεων:", error);
        $(".question-container").html("<p>Αδυναμία φόρτωσης ερωτήσεων.</p>");
      });
  }

  // 2. Εμφάνιση μίας ερώτησης
  function displayQuestion(index, showError) {
    // Αν index > 0, εμφανίζουμε το κουμπί "Πίσω"
    if (index > 0) {
      $("#backButton").show();
    } else {
      $("#backButton").hide();
    }

    // Λαμβάνουμε την αντίστοιχη ερώτηση
    const qObj = allQuestions[index];
    const qText = qObj.question;
    const qInfo = qObj.info || "";
    const qOptions = qObj.options;

    let html = `
      <div class="govgr-field">
        <fieldset class="govgr-fieldset">
          <legend role="heading" class="govgr-fieldset__legend govgr-heading-l">
            ${qText}
          </legend>
          <p class="govgr-hint">${qInfo}</p>
          <div class="govgr-radios">
            <ul>
    `;

    // Δημιουργούμε τα radio options
    qOptions.forEach((optionText, i) => {
      html += `
        <li>
          <label class="govgr-label">
            <input type="radio" name="question-option" value="${i}" />
            ${optionText}
          </label>
        </li>
      `;
    });

    html += `
            </ul>
          </div>
        </fieldset>
      </div>
    `;

    // Εμφάνιση μηνύματος σφάλματος αν showError = true
    if (showError) {
      html += `
        <div style="color:red; margin-top:1rem;">
          <strong>Παρακαλώ επιλέξτε μια απάντηση πριν προχωρήσετε.</strong>
        </div>
      `;
    }

    // Εισάγουμε το HTML στο container
    $(".question-container").html(html);

    // Αν ο χρήστης είχε ήδη απαντήσει πριν
    if (userAnswers[index] !== undefined) {
      $(`input[name="question-option"][value="${userAnswers[index]}"]`).prop("checked", true);
    }

    // Τελευταία ερώτηση -> αλλάζουμε κουμπί σε "Υποβολή"
    if (index === totalQuestions - 1) {
      $("#nextQuestion").text("Υποβολή");
    } else {
      $("#nextQuestion").text("Επόμενη Ερώτηση");
    }

    // Εμφανίζουμε το κουμπί
    $("#nextQuestion").show();
  }

  // 3. Τελικό αποτέλεσμα
  function finalizeResult() {
    let resultHTML = `<h3>Ολοκληρώσατε την Ενημέρωση!</h3>`;
    resultHTML += `<p>Οι απαντήσεις σας:</p>`;

    // Παραγωγή λίστας απαντήσεων
    for (let i = 0; i < totalQuestions; i++) {
      const questionText = allQuestions[i].question;
      const userChoiceIndex = userAnswers[i];
      const userChoice = allQuestions[i].options[userChoiceIndex] || "";
      resultHTML += `<p><strong>${questionText}</strong> - Επιλογή: ${userChoice}</p>`;
    }

    // Ενδεικτικό: μπορούμε να βάλουμε ειδικές συνθήκες
    // π.χ. αν userAnswers[1] = 1 => "Δεν γνωρίζεις τα δικαιολογητικά κ.λπ."

    resultHTML += `
      <hr>
      <p>Για περισσότερες πληροφορίες, δείτε το
         <a href="https://mitos.gov.gr/" target="_blank">ΜΗΤΟΣ</a>
         ή επικοινωνήστε με το αρμόδιο σχολείο/Διεύθυνση Δ.Ε.</p>
    `;

    // Προβολή του αποτελέσματος & απόκρυψη κουμπιών
    $(".question-container").html(resultHTML);
    $("#nextQuestion").hide();
    $("#backButton").hide();

    // (Προαιρετικά) μπορούμε να εμφανίσουμε το FAQ
    // $("#faqContainer").show();
  }

  // 4. nextQuestion κλικ
  $("#nextQuestion").click(function () {
    const selectedVal = $('input[name="question-option"]:checked').val();
    if (selectedVal === undefined) {
      // δεν επέλεξε απάντηση
      displayQuestion(currentQuestion, true);
      return;
    }

    // αποθήκευση απάντησης
    userAnswers[currentQuestion] = parseInt(selectedVal);

    // αν είμαστε στην τελευταία ερώτηση -> finalize
    if (currentQuestion === totalQuestions - 1) {
      finalizeResult();
      return;
    }

    // αλλιώς επόμενη ερώτηση
    currentQuestion++;
    displayQuestion(currentQuestion, false);
  });

  // 5. backButton κλικ
  $("#backButton").click(function () {
    if (currentQuestion > 0) {
      currentQuestion--;
      displayQuestion(currentQuestion, false);
    }
  });

  // 6. Κουμπί "Ας ξεκινήσουμε"
  $("#startBtn").click(function () {
    // Κρύβουμε εισαγωγή
    $("#intro").hide();
    // Εμφανίζουμε το κουτί ερωτήσεων
    $("#questions-btns").show();

    // Ξεκινάμε το ερωτηματολόγιο
    currentQuestion = 0;
    // Αν δεν έχουμε φορτώσει ήδη τις ερωτήσεις, τις φορτώνουμε
    loadQuestionsData().then(() => {
      if (totalQuestions > 0) {
        displayQuestion(currentQuestion, false);
      } else {
        $(".question-container").html("<p>Δεν υπάρχουν διαθέσιμες ερωτήσεις.</p>");
      }
    });
  });
});
