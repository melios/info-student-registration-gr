$("document").ready(function () {
  // --- Μεταβλητές ελέγχου / κατάστασης ---
  var currentQuestion = 0;       // δείκτης για την τρέχουσα ερώτηση
  var totalQuestions = 0;        // πόσες ερωτήσεις έχει το JSON
  var allQuestions = [];         // πίνακας με όλα τα αντικείμενα ερωτήσεων
  var userAnswers = {};          // { "indexΕρώτησης": "επιλεγμένηΑπάντηση" }

  // --- Κρύβουμε τα κουμπιά χειρισμού φόρμας (αν χρειάζεται) στην αρχή ---
  // $("#nextQuestion").hide();
  // $("#backButton").hide();

  // ------------------------------------------------------
  // 1. Συνάρτηση φόρτωσης ερωτήσεων από το JSON αρχείο
  // ------------------------------------------------------
  function getQuestions() {
    return fetch("question-utils/all-questions-school.json")
      .then((response) => response.json())
      .then((data) => {
        allQuestions = data; 
        totalQuestions = data.length;
      })
      .catch((error) => {
        console.error("Αποτυχία φόρτωσης του JSON all-questions-school.json:", error);
        // Προβολή μηνύματος σφάλματος
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Σφάλμα: Δεν μπόρεσε να φορτωθεί το αρχείο των ερωτήσεων για το Γυμνάσιο.";
        $(".question-container").html(errorMessage);

        hideFormBtns();
      });
  }

  // ------------------------------------------------------
  // 2. Συνάρτηση εμφάνισης μιας ερώτησης (loadQuestion)
  // ------------------------------------------------------
  function loadQuestion(questionIndex, showError) {
    // Εμφανίζουμε τα κουμπιά (αν θες να έχεις «πισω» / «επόμενο»):
    $("#nextQuestion").show();
    if (questionIndex > 0) {
      $("#backButton").show();
    } else {
      $("#backButton").hide();
    }

    // Παίρνουμε το αντικείμενο της ερώτησης
    var questionObj = allQuestions[questionIndex];
    var qText = questionObj.question;
    var qInfo = questionObj.info || "";  // έξτρα κείμενο πληροφόρησης
    var qOptions = questionObj.options;  // πίνακας απαντήσεων

    // Φτιάχνουμε το HTML που θα εμφανίσουμε
    var questionElement = `
      <div class="govgr-field">
        <fieldset class="govgr-fieldset">
          <legend role="heading" aria-level="1" class="govgr-fieldset__legend govgr-heading-l">
            ${qText}
          </legend>
          <p class="govgr-hint">${qInfo}</p>
          <div class="govgr-radios">
            <ul>
    `;

    // προσθέτουμε τις επιλογές (options)
    qOptions.forEach((optionText, idx) => {
      questionElement += `
        <li>
          <label class="govgr-label">
            <input class="govgr-radios__input" type="radio" name="question-option" value="${idx}" />
            ${optionText}
          </label>
        </li>
      `;
    });

    questionElement += `
            </ul>
          </div>
        </fieldset>
      </div>
    `;

    // Αν showError = true, δείχνουμε ένα μήνυμα σφάλματος (δεν επέλεξε απάντηση)
    if (showError) {
      questionElement += `
        <div class="govgr-error-message" style="color:red; margin-top:1rem;">
          <strong>Παρακαλώ επιλέξτε μία απάντηση πριν προχωρήσετε.</strong>
        </div>
      `;
    }

    // Τοποθετούμε το τελικό HTML μέσα στο container
    $(".question-container").html(questionElement);

    // Αν ο χρήστης είχε ήδη απαντήσει νωρίτερα, επιλέγουμε το αντίστοιχο radio
    if (userAnswers[questionIndex] !== undefined) {
      $(`input[name="question-option"][value="${userAnswers[questionIndex]}"]`).prop("checked", true);
    }

    // Αν βρισκόμαστε στην τελευταία ερώτηση, αλλάζουμε το κείμενο του κουμπιού
    if (questionIndex === totalQuestions - 1) {
      $("#nextQuestion").text("Υποβολή");
    } else {
      $("#nextQuestion").text("Επόμενη Ερώτηση");
    }
  }

  // ------------------------------------------------------
  // 3. Συνάρτηση εμφάνισης του τελικού αποτελέσματος
  // ------------------------------------------------------
  function finalizeResult() {
    // Παράδειγμα: Σύνθεση περίληψης
    let resultHTML = "<h3>Ολοκληρώσατε την Ενημέρωση για την Εγγραφή στο Γυμνάσιο!</h3>";
    resultHTML += "<p>Οι επιλογές σας ήταν:</p>";

    for (let i = 0; i < totalQuestions; i++) {
      const qObj = allQuestions[i];
      const userChoiceIndex = userAnswers[i];
      const userChoiceText = qObj.options[userChoiceIndex] || "";
      resultHTML += `<p><strong>${qObj.question}</strong>: ${userChoiceText}</p>`;
    }

    // Μπορείς να προσθέσεις έξτρα λογική, π.χ. αν userAnswers[2] === 0 -> «Έχετε παιδί με ειδικές ανάγκες»
    // ή αν userAnswers[1] === 1 -> «Δεν γνωρίζετε τα δικαιολογητικά, δείτε το site X»
    // κ.λπ.

    resultHTML += `
      <hr>
      <p>
        Ανάλογα με τις απαντήσεις σας, μπορείτε να προχωρήσετε στην κατάθεση των δικαιολογητικών
        ή να επισκεφθείτε τον επίσημο ιστότοπο <a href="https://mitos.gov.gr/" target="_blank">ΜΗΤΟΣ</a>
        για περαιτέρω οδηγίες.
      </p>
    `;

    // Προβολή του αποτελέσματος
    $(".question-container").html(resultHTML);

    // Κρύβουμε τα κουμπιά
    $("#nextQuestion").hide();
    $("#backButton").hide();
  }

  // ------------------------------------------------------
  // 4. Συνάρτηση διαχείρισης των κουμπιών
  // ------------------------------------------------------
  $("#nextQuestion").click(function () {
    // Έλεγχος αν ο χρήστης επέλεξε μια απάντηση
    var selectedRadio = $('input[name="question-option"]:checked').val();
    if (selectedRadio === undefined) {
      // Δεν επελέγη απάντηση => δείξε σφάλμα
      loadQuestion(currentQuestion, true);
      return;
    }

    // Αποθήκευση της απάντησης
    userAnswers[currentQuestion] = parseInt(selectedRadio);

    // Αν βρισκόμαστε στην τελευταία ερώτηση, επιδεικνύουμε το τελικό αποτέλεσμα
    if (currentQuestion === totalQuestions - 1) {
      finalizeResult();
      return;
    }

    // Αλλιώς περνάμε στην επόμενη ερώτηση
    currentQuestion++;
    loadQuestion(currentQuestion, false);
  });

  $("#backButton").click(function () {
    if (currentQuestion > 0) {
      currentQuestion--;
      loadQuestion(currentQuestion, false);
    }
  });

  // ------------------------------------------------------
  // 5. Βοηθητική συνάρτηση για να κρύβουμε τα κουμπιά, αν χρειαστεί
  // ------------------------------------------------------
  function hideFormBtns() {
    $("#nextQuestion").hide();
    $("#backButton").hide();
  }

  // ------------------------------------------------------
  // 6. Έναρξη της ροής - Φόρτωση ερωτήσεων και εμφάνιση 1ης
  // ------------------------------------------------------
  getQuestions().then(() => {
    // Μόλις φορτωθούν επιτυχώς οι ερωτήσεις:
    currentQuestion = 0;
    if (totalQuestions > 0) {
      loadQuestion(currentQuestion, false);
    } else {
      $(".question-container").html("<p>Δεν υπάρχουν ερωτήσεις διαθέσιμες.</p>");
      hideFormBtns();
    }
  });
});
